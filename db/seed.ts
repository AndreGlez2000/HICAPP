import { getDB } from './index';

/**
 * Wipes all user data and loads fresh demo data for the CURRENT month.
 * Used by the "Modo Demo" button in Onboarding.
 */
export async function loadDemoDataFresh(): Promise<void> {
  const db = getDB();

  // Wipe everything
  await db.runAsync('DELETE FROM mi_dia_log');
  await db.runAsync('DELETE FROM goals');
  await db.runAsync('DELETE FROM photos');
  await db.runAsync('DELETE FROM user');

  await insertDemoData(db);
}

/**
 * Seeds demo data: Carlos Ramírez + 3 goals + current-month logs.
 * Guard: only inserts if user table is empty.
 */
export async function seedDemoData(): Promise<void> {
  const db = getDB();

  // Guard: check if user data already exists
  const existingUser = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM user LIMIT 1'
  );

  if (existingUser) {
    // Data already seeded — no-op
    return;
  }

  await insertDemoData(db);
}

type DBLike = { runAsync: (sql: string, params?: any[]) => Promise<any> };
type LogEntry = { day: number; categoria: 'alimentacion' | 'actividad' | 'sueno' };

// Meal options for photo simulation
const DEMO_MEALS = [
  'Avena con fruta', 'Tacos de pollo', 'Ensalada de atún', 'Sopa de verduras',
  'Sándwich integral', 'Yogurt con granola', 'Arroz con frijoles', 'Quesadillas',
  'Fruta con queso', 'Caldo de res',
];
const DEMO_MOODS = ['feliz', 'bien', 'regular', 'bien', 'feliz'];
const DEMO_PORTIONS = ['completo', 'casi todo', 'la mitad', 'completo', 'casi todo'];

/** Returns a YYYY-MM string for N months ago */
function monthAgo(n: number): { year: number; month: string; monthNum: number } {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  return {
    year: d.getFullYear(),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    monthNum: d.getMonth() + 1,
  };
}

/** Returns the number of days in a given YYYY-MM month */
function daysInMonth(year: number, monthNum: number): number {
  return new Date(year, monthNum, 0).getDate();
}

async function insertDemoData(db: DBLike): Promise<void> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const currentMonth = `${year}-${month}`;
  const today = now.getDate();

  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = (y: number, m: string, day: number) => `${y}-${m}-${pad(day)}`;

  // Insert demo user
  await db.runAsync(
    `INSERT INTO user (id, nombre, nickname, edad, peso, talla, expediente, onboarding_complete, created_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, 1, ?)`,
    ['Carlos Ramírez', 'Carlitos', 10, 38.0, 1.42, 'HC-2026-001', now.toISOString()]
  );

  // Insert 3 goals for current month
  await db.runAsync(
    `INSERT INTO goals (categoria, titulo, dias_target, count_mes, mes) VALUES (?, ?, ?, ?, ?)`,
    ['alimentacion', 'Comer fruta en el desayuno', 5, 0, currentMonth]
  );
  await db.runAsync(
    `INSERT INTO goals (categoria, titulo, dias_target, count_mes, mes) VALUES (?, ?, ?, ?, ?)`,
    ['actividad', 'Salir a jugar 30 minutos', 3, 0, currentMonth]
  );
  await db.runAsync(
    `INSERT INTO goals (categoria, titulo, dias_target, count_mes, mes) VALUES (?, ?, ?, ?, ?)`,
    ['sueno', 'Apagar pantallas a las 9pm', 6, 0, currentMonth]
  );

  // ── Current month logs (days 1..today) ──────────────────────────────────────
  // alimentacion: most days, actividad: every 2-3 days, sueno: most nights
  const currentLogs: LogEntry[] = [];
  for (let d = 1; d <= Math.min(today, 28); d++) {
    if (d % 9 !== 0) currentLogs.push({ day: d, categoria: 'alimentacion' });
    if (d % 3 === 0 || d % 7 === 0) currentLogs.push({ day: d, categoria: 'actividad' });
    if (d % 5 !== 0) currentLogs.push({ day: d, categoria: 'sueno' });
  }
  for (const { day, categoria } of currentLogs) {
    await db.runAsync(
      `INSERT OR IGNORE INTO mi_dia_log (fecha, categoria, completado) VALUES (?, ?, 1)`,
      [dateStr(year, month, day), categoria]
    );
  }

  // ── 1 month ago: good adherence (~80%) ──────────────────────────────────────
  const m1 = monthAgo(1);
  const days1 = daysInMonth(m1.year, m1.monthNum);
  for (let d = 1; d <= days1; d++) {
    if (d % 6 !== 0) await db.runAsync(
      `INSERT OR IGNORE INTO mi_dia_log (fecha, categoria, completado) VALUES (?, ?, 1)`,
      [dateStr(m1.year, m1.month, d), 'alimentacion']
    );
    if (d % 2 === 0) await db.runAsync(
      `INSERT OR IGNORE INTO mi_dia_log (fecha, categoria, completado) VALUES (?, ?, 1)`,
      [dateStr(m1.year, m1.month, d), 'actividad']
    );
    if (d % 7 !== 0) await db.runAsync(
      `INSERT OR IGNORE INTO mi_dia_log (fecha, categoria, completado) VALUES (?, ?, 1)`,
      [dateStr(m1.year, m1.month, d), 'sueno']
    );
  }

  // ── 2 months ago: lower adherence (~50%) ────────────────────────────────────
  const m2 = monthAgo(2);
  const days2 = daysInMonth(m2.year, m2.monthNum);
  for (let d = 1; d <= days2; d++) {
    if (d % 2 === 0) await db.runAsync(
      `INSERT OR IGNORE INTO mi_dia_log (fecha, categoria, completado) VALUES (?, ?, 1)`,
      [dateStr(m2.year, m2.month, d), 'alimentacion']
    );
    if (d % 4 === 0) await db.runAsync(
      `INSERT OR IGNORE INTO mi_dia_log (fecha, categoria, completado) VALUES (?, ?, 1)`,
      [dateStr(m2.year, m2.month, d), 'actividad']
    );
    if (d % 3 === 0) await db.runAsync(
      `INSERT OR IGNORE INTO mi_dia_log (fecha, categoria, completado) VALUES (?, ?, 1)`,
      [dateStr(m2.year, m2.month, d), 'sueno']
    );
  }

  // ── Photos: 4 per past month, 2 for current month ───────────────────────────
  const photoEntries: { isoDate: string; meal: string; mood: string; portion: string; note: string }[] = [
    // 2 months ago
    { isoDate: `${m2.year}-${m2.month}-05T09:15:00.000Z`, meal: DEMO_MEALS[0], mood: DEMO_MOODS[0], portion: DEMO_PORTIONS[0], note: 'Le encantó la avena' },
    { isoDate: `${m2.year}-${m2.month}-12T13:30:00.000Z`, meal: DEMO_MEALS[1], mood: DEMO_MOODS[1], portion: DEMO_PORTIONS[1], note: '' },
    { isoDate: `${m2.year}-${m2.month}-20T12:00:00.000Z`, meal: DEMO_MEALS[3], mood: DEMO_MOODS[2], portion: DEMO_PORTIONS[2], note: 'Se lo terminó todo' },
    { isoDate: `${m2.year}-${m2.month}-27T13:45:00.000Z`, meal: DEMO_MEALS[6], mood: DEMO_MOODS[3], portion: DEMO_PORTIONS[3], note: '' },
    // 1 month ago
    { isoDate: `${m1.year}-${m1.month}-03T08:50:00.000Z`, meal: DEMO_MEALS[5], mood: DEMO_MOODS[4], portion: DEMO_PORTIONS[4], note: 'Buen desayuno' },
    { isoDate: `${m1.year}-${m1.month}-10T13:10:00.000Z`, meal: DEMO_MEALS[2], mood: DEMO_MOODS[1], portion: DEMO_PORTIONS[0], note: '' },
    { isoDate: `${m1.year}-${m1.month}-18T12:30:00.000Z`, meal: DEMO_MEALS[7], mood: DEMO_MOODS[0], portion: DEMO_PORTIONS[1], note: 'Comió con apetito' },
    { isoDate: `${m1.year}-${m1.month}-25T13:00:00.000Z`, meal: DEMO_MEALS[9], mood: DEMO_MOODS[3], portion: DEMO_PORTIONS[2], note: '' },
    // Current month
    { isoDate: `${year}-${month}-02T09:00:00.000Z`, meal: DEMO_MEALS[8], mood: DEMO_MOODS[0], portion: DEMO_PORTIONS[0], note: '' },
    { isoDate: `${year}-${month}-${pad(Math.min(today, 8))}T13:20:00.000Z`, meal: DEMO_MEALS[4], mood: DEMO_MOODS[1], portion: DEMO_PORTIONS[3], note: 'Muy bien hoy' },
  ];

  for (const p of photoEntries) {
    await db.runAsync(
      `INSERT INTO photos (uri, meal, mood, portion, note, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['demo://photo', p.meal, p.mood, p.portion, p.note, p.isoDate]
    );
  }
}
