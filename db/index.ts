import * as SQLite from 'expo-sqlite';
import { ALL_SCHEMAS, SQL_MIGRATION_V2 } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

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
  try {
    await SQLite.deleteDatabaseAsync('hic.db');
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not found')) {
      return;
    }
    throw error;
  }
}
