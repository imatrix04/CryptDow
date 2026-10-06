import { ElectronAPI } from '@electron-toolkit/preload'
import type { CryptDowApi } from '../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: CryptDowApi
  }
}