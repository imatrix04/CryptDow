import Decimal from 'decimal.js'
import { useBalances, usePortfolioInfo } from '../hooks/usePortfolio'
import { usePrices } from '../hooks/usePrices'

export function PortfolioPanel() {
  const { data: balances = [] } = useBalances()
  const { data: info } = usePortfolioInfo()
  const { data: prices } = usePrices()
  const initial = new Decimal(info?.initialBalance ?? 0)

  const rows = balances
    .map((b) => {
      const amount = new Decimal(b.free).plus(b.locked)
      const price = b.asset === 'USDT' ? new Decimal(1) : prices?.[`${b.asset}USDT`]
      const value = price ? amount.mul(price) : null
      return { asset: b.asset, amount, value }
    })
    .filter((r) => r.amount.gt(0))

  const total = rows.reduce((acc, r) => acc.plus(r.value ?? 0), new Decimal(0))
  const pnl = total.minus(initial)
  const pnlPct = initial.gt(0) ? pnl.div(initial).mul(100) : new Decimal(0)
  const positive = pnl.gte(0)

  return (
    <section className="rounded bg-[#151822] p-3">
      <h2 className="mb-1 text-xs uppercase text-gray-400">Valeur du portefeuille</h2>
      <div className="text-2xl font-semibold">
        {total.toFixed(2)} <span className="text-sm text-gray-400">USDT</span>
      </div>
      <div className={`text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {positive ? '+' : ''}
        {pnl.toFixed(2)} ({positive ? '+' : ''}
        {pnlPct.toFixed(2)} %)
      </div>

      <ul className="mt-3 space-y-1 text-sm">
        {rows.map((r) => (
          <li key={r.asset} className="flex justify-between">
            <span>{r.asset}</span>
            <span className="text-gray-300">
              {r.amount.toDecimalPlaces(6).toFixed()}
              {r.value && (
                <span className="ml-2 text-gray-500">≈ {r.value.toFixed(2)}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}