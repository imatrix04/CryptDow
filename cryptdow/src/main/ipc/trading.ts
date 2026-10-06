import { ipcMain } from 'electron'
import { placeMarketOrder, getBalances, getTrades } from '../engine/orders'
import { getPortfolio, resetPortfolio } from '../engine/portfolio'

export function registerTradingIpc() {
  ipcMain.handle('portfolio:balances', (_e, portfolioId: number) => getBalances(portfolioId))
  ipcMain.handle('portfolio:trades', (_e, portfolioId: number) => getTrades(portfolioId))
  ipcMain.handle('trading:market-order', (_e, input) => placeMarketOrder(input))
  ipcMain.handle('portfolio:get', (_e, portfolioId: number) => getPortfolio(portfolioId))
  ipcMain.handle('portfolio:reset', (_e, portfolioId: number, amount: string) =>
    resetPortfolio(portfolioId, amount)
  )
}