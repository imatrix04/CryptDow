import { and, eq, desc } from 'drizzle-orm'
import { getDb } from '../db'
import { balances, orders, pairs, trades } from '../db/schema'
import type { MarketOrderInput, TradeRow, BalanceRow } from '../../shared/types'
import { D, Decimal } from './money'
import { FEE_RATE, SLIPPAGE_RATE, MIN_NOTIONAL } from './config'
import { getPrice } from './prices'

type Db = ReturnType<typeof getDb>
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]

function getFree(tx: Tx, portfolioId: number, asset: string): Decimal {
  const row = tx
    .select()
    .from(balances)
    .where(and(eq(balances.portfolioId, portfolioId), eq(balances.assetSymbol, asset)))
    .get()
  return D(row?.free ?? '0')
}

function setFree(tx: Tx, portfolioId: number, asset: string, value: Decimal) {
  tx.insert(balances)
    .values({ portfolioId, assetSymbol: asset, free: value.toFixed(), locked: '0' })
    .onConflictDoUpdate({
      target: [balances.portfolioId, balances.assetSymbol],
      set: { free: value.toFixed() }
    })
    .run()
}

export async function placeMarketOrder(input: MarketOrderInput): Promise<TradeRow> {
  const db = getDb()

  const pair = db.select().from(pairs).where(eq(pairs.symbol, input.pair)).get()
  if (!pair) throw new Error(`Paire inconnue : ${input.pair}`)

  const qty = D(input.quantity).toDecimalPlaces(pair.qtyPrecision, Decimal.ROUND_DOWN)
  if (!qty.gt(0)) throw new Error('Quantité invalide')

  // Prix de marché + slippage défavorable
  const market = D(await getPrice(pair.symbol))
  const slip = D(SLIPPAGE_RATE)
  const price = (
    input.side === 'BUY' ? market.mul(D(1).plus(slip)) : market.mul(D(1).minus(slip))
  ).toDecimalPlaces(pair.pricePrecision)

  const notional = qty.mul(price)
  if (notional.lt(MIN_NOTIONAL)) {
    throw new Error(`Ordre trop petit : minimum ${MIN_NOTIONAL} ${pair.quoteAsset}`)
  }

  const now = Date.now()

  return db.transaction((tx) => {
    let fee: Decimal
    let feeAsset: string

    if (input.side === 'BUY') {
      const quoteFree = getFree(tx, input.portfolioId, pair.quoteAsset)
      if (quoteFree.lt(notional)) {
        throw new Error(`Solde ${pair.quoteAsset} insuffisant`)
      }
      fee = qty.mul(FEE_RATE)
      feeAsset = pair.baseAsset
      setFree(tx, input.portfolioId, pair.quoteAsset, quoteFree.minus(notional))
      const baseFree = getFree(tx, input.portfolioId, pair.baseAsset)
      setFree(tx, input.portfolioId, pair.baseAsset, baseFree.plus(qty).minus(fee))
    } else {
      const baseFree = getFree(tx, input.portfolioId, pair.baseAsset)
      if (baseFree.lt(qty)) {
        throw new Error(`Solde ${pair.baseAsset} insuffisant`)
      }
      fee = notional.mul(FEE_RATE)
      feeAsset = pair.quoteAsset
      setFree(tx, input.portfolioId, pair.baseAsset, baseFree.minus(qty))
      const quoteFree = getFree(tx, input.portfolioId, pair.quoteAsset)
      setFree(tx, input.portfolioId, pair.quoteAsset, quoteFree.plus(notional).minus(fee))
    }

    const order = tx
      .insert(orders)
      .values({
        portfolioId: input.portfolioId,
        pairSymbol: pair.symbol,
        side: input.side,
        type: 'MARKET',
        quantity: qty.toFixed(),
        status: 'FILLED',
        createdAt: now,
        updatedAt: now
      })
      .returning()
      .get()

    const trade = tx
      .insert(trades)
      .values({
        orderId: order.id,
        price: price.toFixed(),
        quantity: qty.toFixed(),
        fee: fee.toFixed(),
        feeAsset,
        executedAt: now
      })
      .returning()
      .get()

    return {
      id: trade.id,
      pair: pair.symbol,
      side: input.side,
      price: trade.price,
      quantity: trade.quantity,
      fee: trade.fee,
      feeAsset: trade.feeAsset,
      executedAt: trade.executedAt
    }
  })
}

export function getBalances(portfolioId: number): BalanceRow[] {
  return getDb()
    .select()
    .from(balances)
    .where(eq(balances.portfolioId, portfolioId))
    .all()
    .map((b) => ({ asset: b.assetSymbol, free: b.free, locked: b.locked }))
}

export function getTrades(portfolioId: number): TradeRow[] {
  return getDb()
    .select({
      id: trades.id,
      pair: orders.pairSymbol,
      side: orders.side,
      price: trades.price,
      quantity: trades.quantity,
      fee: trades.fee,
      feeAsset: trades.feeAsset,
      executedAt: trades.executedAt
    })
    .from(trades)
    .innerJoin(orders, eq(trades.orderId, orders.id))
    .where(eq(orders.portfolioId, portfolioId))
    .orderBy(desc(trades.executedAt))
    .limit(100)
    .all()
}