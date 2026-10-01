import { useEffect, useRef } from 'react'
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp
} from 'lightweight-charts'
import { useMarketStore } from '../stores/marketStore'
import { useKlines } from '../hooks/useKlines'
import { useKlineStream } from '../hooks/useKlineStream'

export function PriceChart() {
  const { symbol, interval, setLastPrice } = useMarketStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const { data, isLoading, error } = useKlines(symbol, interval)

  // Création du graphique (une seule fois)
  useEffect(() => {
    const chart = createChart(containerRef.current!, {
      autoSize: true,
      layout: { background: { color: '#0f1117' }, textColor: '#d1d5db' },
      grid: { vertLines: { color: '#1f2430' }, horzLines: { color: '#1f2430' } },
      timeScale: { timeVisible: true }
    })
    seriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444'
    })
    chartRef.current = chart
    return () => chart.remove()
  }, [])

  // Chargement de l'historique
  useEffect(() => {
    if (!data || !seriesRef.current) return
    seriesRef.current.setData(
      data.map((c) => ({ ...c, time: c.time as UTCTimestamp }))
    )
    chartRef.current?.timeScale().fitContent()
  }, [data])

  // Mises à jour en direct
  useKlineStream(symbol, interval, (c) => {
    seriesRef.current?.update({ ...c, time: c.time as UTCTimestamp })
    setLastPrice(c.close)
  })

  return (
    <div className="relative h-full w-full">
      {isLoading && <div className="absolute z-10 p-2 text-gray-400">Chargement…</div>}
      {error && <div className="absolute z-10 p-2 text-red-400">Erreur de chargement</div>}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}