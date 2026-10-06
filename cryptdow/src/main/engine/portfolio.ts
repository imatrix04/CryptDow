import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { balances, orders, portfolios, snapshots } from '../db/schema'
import type { PortfolioInfo } from '../../shared/types'
import { D, Decimal } from './money'

const MIN_AMOUNT = '1'
const MAX_AMOUNT = '1000000000'

export function getPortfolio(id: number): PortfolioInfo {
  const p = getDb().select().from(portfolios).where(eq(portfolios.id, id)).get()
  if (!p) throw new Error('Portefeuille introuvable')
  return { id: p.id, name: p.name, initialBalance: p.initialBalance, createdAt: p.createdAt }
}

export function resetPortfolio(id: number, amount: string): PortfolioInfo {
  getPortfolio(id) // vérifie qu'il existe

  let value: Decimal
  try {
    value = D(amount)
  } catch {
    throw new Error('Montant invalide')
  }
  if (!value.isFinite()) throw new Error('Montant invalide')
  value = value.toDecimalPlaces(2, Decimal.ROUND_DOWN)
  if (value.lt(MIN_AMOUNT)) throw new Error(`Montant minimum : ${MIN_AMOUNT} USDT`)
  if (value.gt(MAX_AMOUNT)) throw new Error('Montant maximum : 1 000 000 000 USDT')

  getDb().transaction((tx) => {
    // Les trades partent avec leurs ordres (ON DELETE CASCADE)
    tx.delete(orders).where(eq(orders.portfolioId, id)).run()
    tx.delete(snapshots).where(eq(snapshots.portfolioId, id)).run()
    tx.delete(balances).where(eq(balances.portfolioId, id)).run()

    tx.insert(balances)
      .values({ portfolioId: id, assetSymbol: 'USDT', free: value.toFixed(), locked: '0' })
      .run()

    tx.update(portfolios)
      .set({ initialBalance: value.toFixed(), createdAt: Date.now() })
      .where(eq(portfolios.id, id))
      .run()
  })

  return getPortfolio(id)
}