import Database from "@tauri-apps/plugin-sql";

export let db = Database.get("sqlite:test.db");
if (!db) {
  db = new Database("sqlite:test.db");
} else {
  db = await Database.load("sqlite:test.db");
}
await db.execute(
  "CREATE TABLE IF NOT EXISTS settings (flag TEXT PRIMARY KEY, value TEXT)"
);
