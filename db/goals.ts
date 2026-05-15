import { getDB } from './index';

export interface GoalRow {
  id: number;
  categoria: 'alimentacion' | 'actividad' | 'sueno';
  titulo: string;
  dias_target: number;
  count_mes: number;
  mes: string;
}

export async function getGoals(): Promise<GoalRow[]> {
  const db = getDB();
  return db.getAllAsync<GoalRow>('SELECT * FROM goals ORDER BY id ASC');
}

export async function upsertGoal(goal: Omit<GoalRow, 'id'> & { id?: number }): Promise<void> {
  const db = getDB();

  if (goal.id !== undefined) {
    await db.runAsync(
      `UPDATE goals SET categoria = ?, titulo = ?, dias_target = ?, count_mes = ?, mes = ?
       WHERE id = ?`,
      [goal.categoria, goal.titulo, goal.dias_target, goal.count_mes, goal.mes, goal.id]
    );
  } else {
    await db.runAsync(
      `INSERT INTO goals (categoria, titulo, dias_target, count_mes, mes)
       VALUES (?, ?, ?, ?, ?)`,
      [goal.categoria, goal.titulo, goal.dias_target, goal.count_mes, goal.mes]
    );
  }
}

export async function deleteGoal(id: number): Promise<void> {
  const db = getDB();
  await db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
}
