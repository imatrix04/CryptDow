export interface Candle {
  time: number // secondes (UTC), format attendu par lightweight-charts
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketOrderInput {
  portfolioId: number
  pair: string // ex. 'BTCUSDT'
  side: 'BUY' | 'SELL'
  quantity: string // en actif de base, string pour garder la précision
}

export interface BalanceRow {
  asset: string
  free: string
  locked: string
}

export interface TradeRow {
  id: number
  pair: string
  side: 'BUY' | 'SELL'
  price: string
  quantity: string
  fee: string
  feeAsset: string
  executedAt: number
}

export interface PortfolioInfo {
  id: number
  name: string
  initialBalance: string
  createdAt: number
}

export interface CryptDowApi {
  getBalances: (portfolioId: number) => Promise<BalanceRow[]>
  getTrades: (portfolioId: number) => Promise<TradeRow[]>
  placeMarketOrder: (input: MarketOrderInput) => Promise<TradeRow>
  getPortfolio: (portfolioId: number) => Promise<PortfolioInfo>
  resetPortfolio: (portfolioId: number, amount: string) => Promise<PortfolioInfo>
}