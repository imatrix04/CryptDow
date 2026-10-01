import { PriceChart } from './components/PriceChart'
import { useMarketStore } from './stores/marketStore'

export default function App() {
  const { symbol, lastPrice } = useMarketStore()
  return (
    <div className="flex h-screen flex-col bg-[#0f1117] text-white">
      <header className="flex items-center gap-4 border-b border-gray-800 p-3">
        <h1 className="font-bold">CryptDow</h1>
        <span>{symbol}</span>
        <span className="text-green-400">{lastPrice?.toFixed(2) ?? '—'}</span>
      </header>
      <main className="flex-1">
        <PriceChart />
      </main>
    </div>
  )
}