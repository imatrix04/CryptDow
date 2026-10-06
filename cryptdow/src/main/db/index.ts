import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'
import { join } from 'path'
import * as schema from './schema'

let db: ReturnType<typeof createDb>

function createDb() {
  const sqlite = new Database(join(app.getPath('userData'), 'cryptdow.db'))
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  return drizzle(sqlite, { schema })
}

export function initDb() {
  db = createDb()
  // En dev : le dossier drizzle/ est à la racine du projet
  migrate(db, { migrationsFolder: join(__dirname, '../../drizzle') })
  seed()
  return db
}

export const getDb = () => db

function seed() {
  const d = getDb()
  d.insert(schema.assets)
    .values([
      { symbol: 'USDT', name: 'Tether' },
      { symbol: 'BTC', name: 'Bitcoin' },
      { symbol: 'ETH', name: 'Ethereum' },
      { symbol: 'SOL', name: 'Solana' },
      { symbol: 'BNB', name: 'BNB' },
      { symbol: 'XRP', name: 'XRP' }
    ])
    .onConflictDoNothing()
    .run()

  d.insert(schema.pairs)
    .values([
      { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', pricePrecision: 2, qtyPrecision: 5 },
      { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', pricePrecision: 2, qtyPrecision: 4 },
      { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', pricePrecision: 2, qtyPrecision: 3 },
      { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', pricePrecision: 2, qtyPrecision: 3 },
      { symbol: 'XRPUSDT', baseAsset: 'XRP', quoteAsset: 'USDT', pricePrecision: 4, qtyPrecision: 1 }
    ])
    .onConflictDoNothing()
    .run()

  // Portefeuille par défaut : 10 000 USDT fictifs
  if (d.select().from(schema.portfolios).all().length === 0) {
    const now = Date.now()
    const p = d
      .insert(schema.portfolios)
      .values({ name: 'Principal', quoteCurrency: 'USDT', initialBalance: '10000', createdAt: now })
      .returning()
      .get()
    d.insert(schema.balances)
      .values({ portfolioId: p.id, assetSymbol: 'USDT', free: '10000', locked: '0' })
      .run()
  }
}