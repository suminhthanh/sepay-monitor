import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey(), // SePay transaction id
  accountNumber: text("account_number").notNull(),
  bankBrandName: text("bank_brand_name").notNull().default(""),
  amountIn: real("amount_in").notNull().default(0),
  amountOut: real("amount_out").notNull().default(0),
  transactionContent: text("transaction_content").notNull().default(""),
  transactionDate: text("transaction_date").notNull(),
  announced: integer("announced", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const appState = sqliteTable("app_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
