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

  const keys = Object.keys(data);
  if (keys.length === 0) return; // nothing to write

  const values = Object.values(data);

  // Build column lists for INSERT and the SET clause for the conflict branch.
  // Using a single atomic INSERT … ON CONFLICT eliminates the SELECT→write
  // race condition that occurred when two concurrent calls both missed the
  // existing-row check and tried to INSERT simultaneously.
  const insertCols = ['id', ...keys].join(', ');
  const insertPlaceholders = ['?', ...keys.map(() => '?')].join(', ');
  const updateSet = keys.map((k) => `${k} = excluded.${k}`).join(', ');

  await db.runAsync(
    `INSERT INTO user (${insertCols}) VALUES (${insertPlaceholders})
     ON CONFLICT(id) DO UPDATE SET ${updateSet}`,
    [1, ...values]
  );
}
