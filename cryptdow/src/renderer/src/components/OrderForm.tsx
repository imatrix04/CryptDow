import { useState } from 'react'
import Decimal from 'decimal.js'
import { useMarketStore } from '../stores/marketStore'
import { useBalances, usePlaceOrder } from '../hooks/usePortfolio'

const FEE = new Decimal('0.001')
const SLIPPAGE = new Decimal('0.0005')

function cleanError(msg: string) {
  return msg.replace(/^Error invoking remote method '[^']+': (Error: )?/, '')
}

export function OrderForm() {
  const symbol = useMarketStore((s) => s.symbol)
  const lastPrice = useMarketStore((s) => s.lastPrice)
  const { data: balances = [] } = useBalances()
  const order = usePlaceOrder()

  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
  const [quantity, setQuantity] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const base = symbol.replace('USDT', '')
  const free = (asset: string) => new Decimal(balances.find((b) => b.asset === asset)?.free ?? 0)
  const price = lastPrice ? new Decimal(lastPrice) : null

  const qty = (() => {
    try {
      return quantity ? new Decimal(quantity) : null
    } catch {
      return null
    }
  })()

  const estimated =
    qty && price
      ? qty.mul(price.mul(side === 'BUY' ? new Decimal(1).plus(SLIPPAGE) : new Decimal(1).minus(SLIPPAGE)))
      : null

  const setPercent = (pct: number) => {
    if (!price) return
    let q: Decimal
    if (side === 'SELL') {
      q = free(base).mul(pct)
    } else {
      // marge de sécurité : le prix peut bouger entre le clic et l'exécution
      q = free('USDT').mul(pct).div(price.mul(new Decimal(1).plus(SLIPPAGE))).mul('0.998')
    }
    setQuantity(q.toDecimalPlaces(6, Decimal.ROUND_DOWN).toFixed())
  }

  const submit = () => {
    if (!qty) return
    setMessage(null)
    order.mutate(
      { pair: symbol, side, quantity: qty.toFixed() },
      {
        onSuccess: (t) => {
          setMessage({
            ok: true,
            text: `${side === 'BUY' ? 'Achat' : 'Vente'} exécuté : ${t.quantity} ${base} à ${t.price}`
          })
          setQuantity('')
        },
        onError: (err) => setMessage({ ok: false, text: cleanError((err as Error).message) })
      }
    )
  }

  return (
    <section className="rounded bg-[#151822] p-3">
      <h2 className="mb-2 text-xs uppercase text-gray-400">Ordre au marché · {symbol}</h2>

      <div className="mb-3 grid grid-cols-2 gap-1">
        {(['BUY', 'SELL'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={`rounded py-1.5 text-sm font-medium ${
              side === s
                ? s === 'BUY'
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
                : 'bg-[#1a1d27] text-gray-400'
            }`}
          >
            {s === 'BUY' ? 'Acheter' : 'Vendre'}
          </button>
        ))}
      </div>

      <label className="text-xs text-gray-400">Quantité ({base})</label>
      <input
        value={quantity}
        onChange={(e) => setQuantity(e.target.value.replace(',', '.'))}
        placeholder="0.00"
        inputMode="decimal"
        className="mb-2 w-full rounded bg-[#1a1d27] px-2 py-1.5 text-sm outline-none"
      />

      <div className="mb-3 grid grid-cols-4 gap-1">
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <button
            key={p}
            onClick={() => setPercent(p)}
            className="rounded bg-[#1a1d27] py-1 text-xs text-gray-400 hover:text-white"
          >
            {p * 100} %
          </button>
        ))}
      </div>

      <div className="mb-1 flex justify-between text-xs text-gray-400">
        <span>{side === 'BUY' ? 'Coût estimé' : 'Gain estimé'}</span>
        <span>{estimated ? `${estimated.toFixed(2)} USDT` : '—'}</span>
      </div>
      <div className="mb-3 flex justify-between text-xs text-gray-500">
        <span>Frais ({FEE.mul(100).toString()} %) + slippage</span>
        <span>
          Dispo : {side === 'BUY'
            ? `${free('USDT').toFixed(2)} USDT`
            : `${free(base).toDecimalPlaces(6).toFixed()} ${base}`}
        </span>
      </div>

      <button
        onClick={submit}
        disabled={!qty || !qty.gt(0) || !price || order.isPending}
        className={`w-full rounded py-2 text-sm font-semibold text-white disabled:opacity-40 ${
          side === 'BUY' ? 'bg-green-600' : 'bg-red-600'
        }`}
      >
        {order.isPending ? 'Exécution…' : `${side === 'BUY' ? 'Acheter' : 'Vendre'} ${base}`}
      </button>

      {message && (
        <p className={`mt-2 text-xs ${message.ok ? 'text-green-400' : 'text-red-400'}`}>
          {message.text}
        </p>
      )}
    </section>
  )
}