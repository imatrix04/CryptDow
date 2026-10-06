import { useEffect, useRef } from 'react'
import type { Candle } from '../../../shared/types'

export function useKlineStream(
  symbol: string,
  interval: string,
  onCandle: (c: Candle) => void
) {
  const cbRef = useRef(onCandle)
  cbRef.current = onCandle
  console.log('[WS] hook monté', symbol, interval)

  useEffect(() => {
    let ws: WebSocket | null = null
    let stopped = false
    let retryTimer: ReturnType<typeof setTimeout>

    const connect = () => {
      const url = `wss://data-stream.binance.vision/ws/${symbol.toLowerCase()}@kline_${interval}`
      ws = new WebSocket(url)

      ws.onopen = () => console.log('[WS] connecté', url)
      ws.onerror = () => {
        if (!stopped) console.error('[WS] erreur')
      }
      ws.onclose = (e) => {
        if (stopped) return
        console.log('[WS] fermé', e.code, '→ nouvelle tentative dans 3 s')
        retryTimer = setTimeout(connect, 3000)
      }
      ws.onmessage = (e) => {
        const k = JSON.parse(e.data).k
        if (!k) return
        cbRef.current({
          time: Math.floor(k.t / 1000),
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v)
        })
      }
    }

    connect()

    return () => {
      stopped = true
      clearTimeout(retryTimer)
      if (!ws) return
      // Évite l'avertissement si le socket est encore en cours de connexion
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.onopen = () => ws?.close()
      } else {
        ws.close()
      }
    }
  }, [symbol, interval])
}