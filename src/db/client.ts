import Database from "@tauri-apps/plugin-sql";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _sqliteDb: Database | null = null;

export async function getDb() {
  if (_db) return _db;

  _sqliteDb = await Database.load("sqlite:sepay-monitor.db");

  _db = drizzle(
    async (sql, params, method) => {
      try {
        if (method === "run") {
          await _sqliteDb!.execute(sql, params);
          return { rows: [] };
        }
        const rows = await _sqliteDb!.select<Record<string, unknown>[]>(sql, params);
        // sqlite-proxy expects rows as arrays, not objects
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        return {
          rows: rows.map((row) => columns.map((col) => row[col])),
        };
      } catch (err) {
        console.error("DB error:", err);
        throw err;
      }
    },
    { schema }
  );

  return _db;
}
