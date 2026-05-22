import { getDB } from './index';

export interface MiDiaRow {
  id: number;
  fecha: string;
  categoria: 'alimentacion' | 'actividad' | 'sueno';
  completado: number;
}

export async function getMiDiaLog(): Promise<MiDiaRow[]> {
  const db = getDB();
  return db.getAllAsync<MiDiaRow>(
    'SELECT * FROM mi_dia_log ORDER BY fecha DESC, categoria ASC'
  );
}

export async function getLogForDate(fecha: string): Promise<MiDiaRow[]> {
  const db = getDB();
  return db.getAllAsync<MiDiaRow>(
    'SELECT * FROM mi_dia_log WHERE fecha = ? ORDER BY categoria ASC',
    [fecha]
  );
}

/**
 * Toggles a mi_dia_log entry for (fecha, categoria).
 * If no row exists → insert with completado=1.
 * If row exists → flip completado (0→1 or 1→0).
 *
 * Atomic upsert: a single SQL statement eliminates the SELECT→write
 * race condition that could occur with concurrent toggle calls for
 * the same (fecha, categoria) pair.
 */
export async function toggleMiDia(
  fecha: string,
  categoria: 'alimentacion' | 'actividad' | 'sueno'
): Promise<void> {
  const db = getDB();

  await db.runAsync(
    `INSERT INTO mi_dia_log (fecha, categoria, completado)
     VALUES (?, ?, 1)
     ON CONFLICT(fecha, categoria)
     DO UPDATE SET completado = 1 - mi_dia_log.completado`,
    [fecha, categoria]
  );
}

export async function deleteMiDiaRow(fecha: string, categoria: string): Promise<void> {
  const db = getDB();
  await db.runAsync(
    'DELETE FROM mi_dia_log WHERE fecha = ? AND categoria = ?',
    [fecha, categoria]
  );
}
