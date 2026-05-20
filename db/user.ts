import { getDB } from './index';

export interface UserRow {
  id: number;
  nombre: string;
  nickname: string;
  edad: number;
  peso: number;
  talla: number;
  expediente: string;
  onboarding_complete: number;
  created_at: string;
  fecha_nacimiento: string;
}

export async function getUser(): Promise<UserRow | null> {
  const db = getDB();
  return db.getFirstAsync<UserRow>('SELECT * FROM user WHERE id = 1');
}

export async function upsertUser(data: Partial<Omit<UserRow, 'id'>>): Promise<void> {
  const db = getDB();

  const existing = await db.getFirstAsync<{ id: number }>('SELECT id FROM user WHERE id = 1');

  if (existing) {
    const fields = Object.keys(data)
      .map((k) => `${k} = ?`)
      .join(', ');
    const values = [...Object.values(data), 1];
    await db.runAsync(`UPDATE user SET ${fields} WHERE id = ?`, values);
  } else {
    const fields = ['id', ...Object.keys(data)].join(', ');
    const placeholders = ['?', ...Object.keys(data).map(() => '?')].join(', ');
    const values = [1, ...Object.values(data)];
    await db.runAsync(
      `INSERT INTO user (${fields}) VALUES (${placeholders})`,
      values
    );
  }
}
