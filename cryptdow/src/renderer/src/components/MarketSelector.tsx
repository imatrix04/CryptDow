import { useMarketStore } from '../stores/marketStore'

const SYMBOLS = [
  { value: 'BTCUSDT', label: 'BTC/USDT' },
  { value: 'ETHUSDT', label: 'ETH/USDT' },
  { value: 'SOLUSDT', label: 'SOL/USDT' },
  { value: 'BNBUSDT', label: 'BNB/USDT' },
  { value: 'XRPUSDT', label: 'XRP/USDT' }
]

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d']

export function MarketSelector() {
  const symbol = useMarketStore((s) => s.symbol)
  const interval = useMarketStore((s) => s.interval)
  const setSymbol = useMarketStore((s) => s.setSymbol)
  const setTimeframe = useMarketStore((s) => s.setInterval)

  return (
    <div className="flex items-center gap-3">
      <select
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="rounded bg-[#1a1d27] px-2 py-1 text-sm outline-none"
      >
        {SYMBOLS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <div className="flex gap-1">
        {INTERVALS.map((i) => (
          <button
            key={i}
            onClick={() => setTimeframe(i)}
            className={`rounded px-2 py-1 text-xs ${
              i === interval
                ? 'bg-blue-600 text-white'
                : 'bg-[#1a1d27] text-gray-400 hover:text-white'
            }`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  )
}