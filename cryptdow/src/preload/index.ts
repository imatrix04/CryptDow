import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { CryptDowApi } from '../shared/types'

const api: CryptDowApi = {
  getBalances: (portfolioId) => ipcRenderer.invoke('portfolio:balances', portfolioId),
  getTrades: (portfolioId) => ipcRenderer.invoke('portfolio:trades', portfolioId),
  placeMarketOrder: (input) => ipcRenderer.invoke('trading:market-order', input),
  getPortfolio: (portfolioId) => ipcRenderer.invoke('portfolio:get', portfolioId),
  resetPortfolio: (portfolioId, amount) =>
    ipcRenderer.invoke('portfolio:reset', portfolioId, amount)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
