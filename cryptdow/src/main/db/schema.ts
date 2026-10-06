import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core'

export const portfolios = sqliteTable('portfolios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  quoteCurrency: text('quote_currency').notNull().default('USDT'),
  initialBalance: text('initial_balance').notNull(),
  createdAt: integer('created_at').notNull()
})

export const assets = sqliteTable('assets', {
  symbol: text('symbol').primaryKey(),
  name: text('name').notNull()
})

export const pairs = sqliteTable('pairs', {
  symbol: text('symbol').primaryKey(),
  baseAsset: text('base_asset').notNull().references(() => assets.symbol),
  quoteAsset: text('quote_asset').notNull().references(() => assets.symbol),
  pricePrecision: integer('price_precision').notNull(),
  qtyPrecision: integer('qty_precision').notNull()
})

export const balances = sqliteTable(
  'balances',
  {
    portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
    assetSymbol: text('asset_symbol').notNull().references(() => assets.symbol),
    free: text('free').notNull().default('0'),
    locked: text('locked').notNull().default('0')
  },
  (t) => [primaryKey({ columns: [t.portfolioId, t.assetSymbol] })]
)

export const orders = sqliteTable(
  'orders',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
    pairSymbol: text('pair_symbol').notNull().references(() => pairs.symbol),
    side: text('side', { enum: ['BUY', 'SELL'] }).notNull(),
    type: text('type', { enum: ['MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'] }).notNull(),
    quantity: text('quantity').notNull(),
    limitPrice: text('limit_price'),
    stopPrice: text('stop_price'),
    status: text('status', { enum: ['OPEN', 'FILLED', 'CANCELLED', 'REJECTED'] }).notNull().default('OPEN'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull()
  },
  (t) => [index('orders_portfolio_status_idx').on(t.portfolioId, t.status)]
)

export const trades = sqliteTable(
  'trades',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    price: text('price').notNull(),
    quantity: text('quantity').notNull(),
    fee: text('fee').notNull(),
    feeAsset: text('fee_asset').notNull().references(() => assets.symbol),
    executedAt: integer('executed_at').notNull()
  },
  (t) => [index('trades_order_idx').on(t.orderId)]
)

export const snapshots = sqliteTable(
  'snapshots',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
    ts: integer('ts').notNull(),
    totalValue: text('total_value').notNull()
  },
  (t) => [index('snapshots_portfolio_ts_idx').on(t.portfolioId, t.ts)]
)