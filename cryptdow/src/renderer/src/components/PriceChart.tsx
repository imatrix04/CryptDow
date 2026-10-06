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
  const readyRef = useRef(false)
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
      wickDownColor: '#ef4444',
      priceFormat: { type: 'price', precision: 4, minMove: 0.0001 }
    })
    chartRef.current = chart
    return () => chart.remove()
  }, [])

  // Nouvelle paire / timeframe : on vide le graphique et on bloque le live
  useEffect(() => {
    readyRef.current = false
    seriesRef.current?.setData([])
  }, [symbol, interval])

  // Chargement de l'historique + recentrage
  useEffect(() => {
    const series = seriesRef.current
    const chart = chartRef.current
    if (!data || !series || !chart) return

    series.setData(data.map((c) => ({ ...c, time: c.time as UTCTimestamp })))

    // Réactive l'échelle automatique des prix
    chart.priceScale('right').applyOptions({ autoScale: true })

    // Cadre sur les ~120 dernières bougies, avec un peu d'espace à droite
    const n = data.length
    chart.timeScale().setVisibleLogicalRange({ from: n - 120, to: n + 5 })

    readyRef.current = true
  }, [data])

  useKlineStream(symbol, interval, (c) => {
    setLastPrice(c.close)
    if (!readyRef.current) return
    try {
      seriesRef.current?.update({ ...c, time: c.time as UTCTimestamp })
    } catch (err) {
      console.error('[chart] update', err)
    }
  })
  

  return (
    <div className="relative h-full w-full">
      {isLoading && <div className="absolute z-10 p-2 text-gray-400">Chargement…</div>}
      {error && <div className="absolute z-10 p-2 text-red-400">Erreur de chargement</div>}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}