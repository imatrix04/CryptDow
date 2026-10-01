export interface Candle {
  time: number // secondes (UTC), format attendu par lightweight-charts
  open: number
  high: number
  low: number
  close: number
  volume: number
}