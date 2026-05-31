import { getDb } from "./client";
import { transactions, appState } from "./schema";
import type { NewTransaction, Transaction } from "./schema";
import { desc, eq, gt } from "drizzle-orm";

export async function initDb() {
  // Tables are created by tauri-plugin-sql migration in Rust
  // This just verifies the connection
  const db = await getDb();
  return db;
}

export async function getSinceId(): Promise<number> {
  const db = await getDb();
  const row = await db
    .select()
    .from(appState)
    .where(eq(appState.key, "since_id"))
    .get();
  return row ? parseInt(row.value, 10) : 0;
}

export async function setSinceId(id: number) {
  const db = await getDb();
  await db
    .insert(appState)
    .values({ key: "since_id", value: String(id) })
    .onConflictDoUpdate({ target: appState.key, set: { value: String(id) } });
}

export async function insertTransaction(tx: NewTransaction): Promise<void> {
  const db = await getDb();
  await db.insert(transactions).values(tx).onConflictDoNothing();
}

export async function getTransactions(limit = 100, offset = 0): Promise<Transaction[]> {
  const db = await getDb();
  return db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.transactionDate))
    .limit(limit)
    .offset(offset)
    .all();
}

export async function getTransactionsByFilter(
  creditOnly: boolean,
  limit = 100,
  offset = 0
): Promise<Transaction[]> {
  const db = await getDb();
  const query = db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.transactionDate))
    .limit(limit)
    .offset(offset);

  if (creditOnly) {
    return query.where(gt(transactions.amountIn, 0)).all();
  }
  return query.all();
}

export async function markAnnounced(id: number) {
  const db = await getDb();
  await db
    .update(transactions)
    .set({ announced: true })
    .where(eq(transactions.id, id));
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDb();
  return db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.transactionDate))
    .all();
}
