CREATE TABLE `assets` (
	`symbol` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `balances` (
	`portfolio_id` integer NOT NULL,
	`asset_symbol` text NOT NULL,
	`free` text DEFAULT '0' NOT NULL,
	`locked` text DEFAULT '0' NOT NULL,
	PRIMARY KEY(`portfolio_id`, `asset_symbol`),
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asset_symbol`) REFERENCES `assets`(`symbol`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`portfolio_id` integer NOT NULL,
	`pair_symbol` text NOT NULL,
	`side` text NOT NULL,
	`type` text NOT NULL,
	`quantity` text NOT NULL,
	`limit_price` text,
	`stop_price` text,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pair_symbol`) REFERENCES `pairs`(`symbol`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `orders_portfolio_status_idx` ON `orders` (`portfolio_id`,`status`);--> statement-breakpoint
CREATE TABLE `pairs` (
	`symbol` text PRIMARY KEY NOT NULL,
	`base_asset` text NOT NULL,
	`quote_asset` text NOT NULL,
	`price_precision` integer NOT NULL,
	`qty_precision` integer NOT NULL,
	FOREIGN KEY (`base_asset`) REFERENCES `assets`(`symbol`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`quote_asset`) REFERENCES `assets`(`symbol`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `portfolios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`quote_currency` text DEFAULT 'USDT' NOT NULL,
	`initial_balance` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`portfolio_id` integer NOT NULL,
	`ts` integer NOT NULL,
	`total_value` text NOT NULL,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `snapshots_portfolio_ts_idx` ON `snapshots` (`portfolio_id`,`ts`);--> statement-breakpoint
CREATE TABLE `trades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`price` text NOT NULL,
	`quantity` text NOT NULL,
	`fee` text NOT NULL,
	`fee_asset` text NOT NULL,
	`executed_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fee_asset`) REFERENCES `assets`(`symbol`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `trades_order_idx` ON `trades` (`order_id`);