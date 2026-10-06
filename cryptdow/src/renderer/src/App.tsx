import { PriceChart } from './components/PriceChart'
import { MarketSelector } from './components/MarketSelector'
import { PortfolioPanel } from './components/PortfolioPanel'
import { OrderForm } from './components/OrderForm'
import { TradesTable } from './components/TradesTable'
import { useMarketStore } from './stores/marketStore'
import { ResetPortfolio } from './components/ResetPortfolio'

export default function App() {
  const lastPrice = useMarketStore((s) => s.lastPrice)
  return (
    <div className="flex h-screen flex-col bg-[#0f1117] text-white">
      <header className="flex items-center gap-4 border-b border-gray-800 p-3">
        <h1 className="font-bold">CryptDow</h1>
        <MarketSelector />
        <span className="ml-auto text-lg font-semibold text-green-400">
          {lastPrice?.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) ?? '—'}
        </span>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1">
          <PriceChart />
        </main>
          <aside className="flex w-80 flex-col gap-3 overflow-y-auto border-l border-gray-800 p-3">
            <PortfolioPanel />
            <OrderForm />
            <ResetPortfolio />
          </aside>
      </div>

      <footer className="h-44 overflow-y-auto border-t border-gray-800">
        <TradesTable />
      </footer>
    </div>
  )
}