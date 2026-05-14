import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)

const db = new Database(path.join(dataDir, 'wellness.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS wellness_events (
    id       TEXT PRIMARY KEY,
    user_id  TEXT NOT NULL,
    type     TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    date_key TEXT NOT NULL,
    payload  TEXT NOT NULL DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_events_user_date ON wellness_events (user_id, date_key);
  CREATE INDEX IF NOT EXISTS idx_events_user_ts   ON wellness_events (user_id, timestamp);

  CREATE TABLE IF NOT EXISTS user_wellness_state (
    user_id    TEXT PRIMARY KEY,
    state      TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT DEFAULT (datetime('now'))
  );
`)

export default db
