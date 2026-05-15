import { getDB } from './index';

export interface PhotoRow {
  id: number;
  uri: string;
  meal: string;
  mood: string;
  portion: string;
  note: string;
  created_at: string;
}

export async function getPhotos(): Promise<PhotoRow[]> {
  const db = getDB();
  return db.getAllAsync<PhotoRow>('SELECT * FROM photos ORDER BY created_at DESC');
}

export async function insertPhoto(photo: Omit<PhotoRow, 'id'>): Promise<number> {
  const db = getDB();
  const result = await db.runAsync(
    `INSERT INTO photos (uri, meal, mood, portion, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [photo.uri, photo.meal, photo.mood, photo.portion, photo.note, photo.created_at]
  );
  return result.lastInsertRowId;
}

export async function deletePhoto(id: number): Promise<void> {
  const db = getDB();
  await db.runAsync('DELETE FROM photos WHERE id = ?', [id]);
}
