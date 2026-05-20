// Database schema definitions for HiC app
// All tables use CREATE TABLE IF NOT EXISTS for idempotent initialization

export const SCHEMA_VERSION = 2;

export const SQL_CREATE_MIGRATIONS = `
  CREATE TABLE IF NOT EXISTS _migrations (
    version    INTEGER PRIMARY KEY,
    applied_at TEXT    NOT NULL
  );
`;

export const SQL_CREATE_USER = `
  CREATE TABLE IF NOT EXISTS user (
    id                  INTEGER PRIMARY KEY DEFAULT 1,
    nombre              TEXT    NOT NULL DEFAULT '',
    nickname            TEXT    NOT NULL DEFAULT '',
    edad                INTEGER NOT NULL DEFAULT 0,
    peso                REAL    NOT NULL DEFAULT 0,
    talla               REAL    NOT NULL DEFAULT 0,
    expediente          TEXT    NOT NULL DEFAULT '',
    onboarding_complete INTEGER NOT NULL DEFAULT 0,
    created_at          TEXT    NOT NULL DEFAULT '',
    fecha_nacimiento    TEXT    NOT NULL DEFAULT ''
  );
`;

/**
 * Migration v2: adds fecha_nacimiento column to existing installs.
 * Skipped on new installs (column already present in SQL_CREATE_USER).
 */
export const SQL_MIGRATION_V2 = `
  ALTER TABLE user ADD COLUMN fecha_nacimiento TEXT NOT NULL DEFAULT '';
`;

export const SQL_CREATE_GOALS = `
  CREATE TABLE IF NOT EXISTS goals (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria   TEXT    NOT NULL CHECK(categoria IN ('alimentacion','actividad','sueno')),
    titulo      TEXT    NOT NULL DEFAULT '',
    dias_target INTEGER NOT NULL DEFAULT 5,
    count_mes   INTEGER NOT NULL DEFAULT 0,
    mes         TEXT    NOT NULL DEFAULT ''
  );
`;

export const SQL_CREATE_MI_DIA_LOG = `
  CREATE TABLE IF NOT EXISTS mi_dia_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha       TEXT    NOT NULL,
    categoria   TEXT    NOT NULL CHECK(categoria IN ('alimentacion','actividad','sueno')),
    completado  INTEGER NOT NULL DEFAULT 0,
    UNIQUE(fecha, categoria)
  );
`;

export const SQL_CREATE_PHOTOS = `
  CREATE TABLE IF NOT EXISTS photos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    uri        TEXT    NOT NULL,
    meal       TEXT    NOT NULL DEFAULT '',
    mood       TEXT    NOT NULL DEFAULT '',
    portion    TEXT    NOT NULL DEFAULT '',
    note       TEXT    NOT NULL DEFAULT '',
    created_at TEXT    NOT NULL DEFAULT ''
  );
`;

export const ALL_SCHEMAS = [
  SQL_CREATE_MIGRATIONS,
  SQL_CREATE_USER,
  SQL_CREATE_GOALS,
  SQL_CREATE_MI_DIA_LOG,
  SQL_CREATE_PHOTOS,
];
