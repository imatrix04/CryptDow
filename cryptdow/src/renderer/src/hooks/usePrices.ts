import { useQuery } from '@tanstack/react-query'

export const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']

export function usePrices() {
  return useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const q = encodeURIComponent(JSON.stringify(SYMBOLS))
      const res = await fetch(`https://data-api.binance.vision/api/v3/ticker/price?symbols=${q}`)
      if (!res.ok) throw new Error(`Binance: ${res.status}`)
      const rows: { symbol: string; price: string }[] = await res.json()
      return Object.fromEntries(rows.map((r) => [r.symbol, r.price])) as Record<string, string>
    },
    refetchInterval: 5000
  })
}