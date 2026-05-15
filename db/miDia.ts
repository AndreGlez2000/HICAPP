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
 */
export async function toggleMiDia(
  fecha: string,
  categoria: 'alimentacion' | 'actividad' | 'sueno'
): Promise<void> {
  const db = getDB();

  const existing = await db.getFirstAsync<MiDiaRow>(
    'SELECT * FROM mi_dia_log WHERE fecha = ? AND categoria = ?',
    [fecha, categoria]
  );

  if (existing) {
    const newValue = existing.completado === 1 ? 0 : 1;
    await db.runAsync(
      'UPDATE mi_dia_log SET completado = ? WHERE fecha = ? AND categoria = ?',
      [newValue, fecha, categoria]
    );
  } else {
    await db.runAsync(
      'INSERT INTO mi_dia_log (fecha, categoria, completado) VALUES (?, ?, 1)',
      [fecha, categoria]
    );
  }
}

export async function deleteMiDiaRow(fecha: string, categoria: string): Promise<void> {
  const db = getDB();
  await db.runAsync(
    'DELETE FROM mi_dia_log WHERE fecha = ? AND categoria = ?',
    [fecha, categoria]
  );
}
