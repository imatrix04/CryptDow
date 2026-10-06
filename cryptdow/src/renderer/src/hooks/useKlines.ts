import { useQuery } from '@tanstack/react-query'
import type { Candle } from '../../../shared/types'

async function fetchKlines(symbol: string, interval: string): Promise<Candle[]> {
  const url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Binance: ${res.status}`)
  const rows: any[][] = await res.json()
  return rows.map((r) => ({
    time: Math.floor(r[0] / 1000),
    open: parseFloat(r[1]),
    high: parseFloat(r[2]),
    low: parseFloat(r[3]),
    close: parseFloat(r[4]),
    volume: parseFloat(r[5])
  }))
}

export function useKlines(symbol: string, interval: string) {
  return useQuery({
    queryKey: ['klines', symbol, interval],
    queryFn: () => fetchKlines(symbol, interval)
  })
}