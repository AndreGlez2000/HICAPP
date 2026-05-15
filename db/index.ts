import * as SQLite from 'expo-sqlite';
import { ALL_SCHEMAS, SCHEMA_VERSION } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export function getDB(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

/**
 * Opens the SQLite database and runs schema migrations.
 * Idempotent — safe to call multiple times.
 */
export async function initDB(): Promise<void> {
  if (db) {
    // Already initialized — no-op
    return;
  }

  db = await SQLite.openDatabaseAsync('hic.db');

  // Enable WAL mode for better performance
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Run all schema CREATE TABLE IF NOT EXISTS statements
  for (const sql of ALL_SCHEMAS) {
    await db.execAsync(sql);
  }

  // Check if this migration version was already applied
  const existing = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM _migrations WHERE version = ?',
    [SCHEMA_VERSION]
  );

  if (!existing) {
    // Insert migration version record
    await db.runAsync(
      'INSERT INTO _migrations (version, applied_at) VALUES (?, ?)',
      [SCHEMA_VERSION, new Date().toISOString()]
    );
  }
}
