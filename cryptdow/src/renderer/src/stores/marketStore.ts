import { create } from 'zustand'

interface MarketState {
  symbol: string
  interval: string
  lastPrice: number | null
  setSymbol: (symbol: string) => void
  setInterval: (interval: string) => void
  setLastPrice: (price: number) => void
}

export const useMarketStore = create<MarketState>((set) => ({
  symbol: 'BTCUSDT',
  interval: '1m',
  lastPrice: null,
  setSymbol: (symbol) => set({ symbol, lastPrice: null }),
  setInterval: (interval) => set({ interval }),
  setLastPrice: (lastPrice) => set({ lastPrice })
}))