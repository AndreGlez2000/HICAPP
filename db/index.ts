import * as SQLite from 'expo-sqlite';
import { ALL_SCHEMAS, SQL_MIGRATION_V2 } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Promise-based singleton lock for DB initialization.
 *
 * Why a promise instead of a simple `if (db) return` guard:
 * Without this, two concurrent `await initDB()` calls can both
 * pass the null-check before either one finishes opening the DB,
 * causing `openDatabaseAsync` to be called multiple times and
 * potentially corrupting the initialization sequence.
 *
 * By storing the in-flight promise, every concurrent caller
 * awaits the SAME initialization work — only one `openDatabaseAsync`
 * call is ever made per app lifecycle.
 */
let dbPromise: Promise<void> | null = null;

export function getDB(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

/**
 * Ordered migration map: version number → DDL to execute.
 * Each entry runs exactly once when upgrading from a prior version.
 */
const MIGRATIONS: Record<number, string> = {
  2: SQL_MIGRATION_V2,
};

/**
 * Opens the SQLite database and runs schema migrations.
 * Concurrency-safe — concurrent callers await the same promise.
 */
export async function initDB(): Promise<void> {
  if (dbPromise) {
    // Another call is already in-flight (or completed) — join it
    return dbPromise;
  }

  dbPromise = (async () => {
    db = await SQLite.openDatabaseAsync('hic.db');

    // Enable WAL mode for better performance
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Run all schema CREATE TABLE IF NOT EXISTS statements
    for (const sql of ALL_SCHEMAS) {
      await db.execAsync(sql);
    }

    // Sequential migration runner:
    // 1. Find the highest applied version (0 if _migrations is empty)
    const maxRow = await db.getFirstAsync<{ max_version: number | null }>(
      'SELECT MAX(version) AS max_version FROM _migrations'
    );
    const currentVersion = maxRow?.max_version ?? 0;

    const migrationVersions = Object.keys(MIGRATIONS)
      .map(Number)
      .sort((a, b) => a - b);

    // Fresh install: mark latest version without executing ALTER TABLE
    if (currentVersion === 0 && migrationVersions.length > 0) {
      const latest = migrationVersions[migrationVersions.length - 1];
      await db.runAsync(
        'INSERT INTO _migrations (version, applied_at) VALUES (?, ?)',
        [latest, new Date().toISOString()]
      );
      return;
    }

    // 2. Execute each pending migration in order
    const pendingVersions = migrationVersions.filter((v) => v > currentVersion);

    for (const version of pendingVersions) {
      await db.execAsync(MIGRATIONS[version]);
      await db.runAsync(
        'INSERT INTO _migrations (version, applied_at) VALUES (?, ?)',
        [version, new Date().toISOString()]
      );
    }
  })();

  return dbPromise;
}

/**
 * DANGER: Deletes the database file and resets the app state.
 * Only for development/testing.
 */
export async function deleteDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
  dbPromise = null;
  try {
    await SQLite.deleteDatabaseAsync('hic.db');
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not found')) {
      return;
    }
    throw error;
  }
}
