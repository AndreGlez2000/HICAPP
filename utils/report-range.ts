import type { Categoria, Goal, MiDiaEntry, Photo } from '../store';

export type ReportRange = {
  startMonth: string;
  endMonth: string;
  label: string;
};

export type AdherenceData = {
  categoria: Categoria;
  completed: number;
  total: number;
  pct: number;
};

export type GoalsByMonthRow = {
  month: string;
  categoria: Categoria;
  titulo: string;
  targetDays: number;
  achievedDays: number;
};

export type PhotosSummary = {
  total: number;
};

const CATEGORY_LIST: Categoria[] = ['alimentacion', 'actividad', 'sueno'];

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const pad = (value: number): string => String(value).padStart(2, '0');

export function getLocalMonthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function getLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, monthNum] = monthKey.split('-').map(Number);
  return `${MONTH_NAMES_ES[monthNum - 1]} ${year}`;
}

export function getAvailableMonths(logs: MiDiaEntry[]): string[] {
  const currentMonth = getLocalMonthKey(new Date());
  const monthsFromLogs = new Set(logs.map((log) => log.fecha.substring(0, 7)));
  monthsFromLogs.add(currentMonth);
  return Array.from(monthsFromLogs).sort((a, b) => b.localeCompare(a));
}

export function buildRangeLabel(startMonth: string, endMonth: string): string {
  if (startMonth === endMonth) return formatMonthLabel(startMonth);
  return `${formatMonthLabel(startMonth)} – ${formatMonthLabel(endMonth)}`;
}

export function addMonths(monthKey: string, delta: number): string {
  const [year, monthNum] = monthKey.split('-').map(Number);
  const date = new Date(year, monthNum - 1 + delta, 1);
  return getLocalMonthKey(date);
}

export function isRangeValid(startMonth: string, endMonth: string): boolean {
  return startMonth.localeCompare(endMonth) <= 0;
}

export function getMonthStartDate(monthKey: string): Date {
  const [year, monthNum] = monthKey.split('-').map(Number);
  return new Date(year, monthNum - 1, 1);
}

export function getMonthEndDate(monthKey: string, today = new Date()): Date {
  const [year, monthNum] = monthKey.split('-').map(Number);
  const currentMonth = getLocalMonthKey(today);
  if (monthKey === currentMonth) {
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }
  return new Date(year, monthNum, 0);
}

export function getMonthsInRange(startMonth: string, endMonth: string): string[] {
  if (!isRangeValid(startMonth, endMonth)) return [];
  const months: string[] = [];
  let cursor = startMonth;
  while (cursor.localeCompare(endMonth) <= 0) {
    months.push(cursor);
    cursor = addMonths(cursor, 1);
  }
  return months;
}

export function hasLogsInRange(logs: MiDiaEntry[], range: ReportRange): boolean {
  if (!isRangeValid(range.startMonth, range.endMonth)) return false;
  return logs.some((log) => {
    const monthKey = log.fecha.substring(0, 7);
    return monthKey.localeCompare(range.startMonth) >= 0 && monthKey.localeCompare(range.endMonth) <= 0;
  });
}

function buildCompletedMaps(logs: MiDiaEntry[]) {
  const completedByDate = new Map<string, Set<Categoria>>();
  const completedByMonthCat = new Map<string, number>();

  for (const log of logs) {
    if (log.completado !== 1) continue;
    const dateKey = log.fecha;
    const monthKey = log.fecha.substring(0, 7);
    const monthCatKey = `${monthKey}|${log.categoria}`;

    const set = completedByDate.get(dateKey) ?? new Set<Categoria>();
    set.add(log.categoria);
    completedByDate.set(dateKey, set);

    completedByMonthCat.set(monthCatKey, (completedByMonthCat.get(monthCatKey) ?? 0) + 1);
  }

  return { completedByDate, completedByMonthCat };
}

export function buildRangeStats(
  logs: MiDiaEntry[],
  photos: Photo[],
  range: ReportRange
): {
  adherence: AdherenceData[];
  streak: number;
  photosInRange: Photo[];
} {
  if (!isRangeValid(range.startMonth, range.endMonth)) {
    return {
      adherence: CATEGORY_LIST.map((categoria) => ({
        categoria,
        completed: 0,
        total: 0,
        pct: 0,
      })),
      streak: 0,
      photosInRange: [],
    };
  }

  const monthsInRange = getMonthsInRange(range.startMonth, range.endMonth);
  const today = new Date();
  const currentMonth = getLocalMonthKey(today);

  const totalDays = monthsInRange.reduce((sum, monthKey) => {
    const endDate = monthKey === currentMonth ? today : getMonthEndDate(monthKey, today);
    return sum + endDate.getDate();
  }, 0);

  const { completedByDate, completedByMonthCat } = buildCompletedMaps(logs);

  const adherence = CATEGORY_LIST.map((categoria) => {
    const completed = monthsInRange.reduce((sum, monthKey) => {
      const key = `${monthKey}|${categoria}`;
      return sum + (completedByMonthCat.get(key) ?? 0);
    }, 0);
    const pct = totalDays > 0 ? Math.round((completed / totalDays) * 100) : 0;
    return { categoria, completed, total: totalDays, pct };
  });

  const startDate = getMonthStartDate(range.startMonth);
  const endDate = getMonthEndDate(range.endMonth, today);
  let maxStreak = 0;
  let currentStreak = 0;
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  while (cursor <= endDate) {
    const dateKey = getLocalDateKey(cursor);
    const completedSet = completedByDate.get(dateKey);
    const isComplete = completedSet
      ? CATEGORY_LIST.every((cat) => completedSet.has(cat))
      : false;
    if (isComplete) {
      currentStreak += 1;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const photosInRange = photos
    .filter((photo) => {
      const monthKey = getLocalMonthKey(new Date(photo.created_at));
      return monthKey.localeCompare(range.startMonth) >= 0 && monthKey.localeCompare(range.endMonth) <= 0;
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return { adherence, streak: maxStreak, photosInRange };
}

export function buildGoalsByMonth(
  goals: Goal[],
  logs: MiDiaEntry[],
  range: ReportRange
): GoalsByMonthRow[] {
  if (!goals.length || !isRangeValid(range.startMonth, range.endMonth)) return [];

  const monthsInRange = new Set(getMonthsInRange(range.startMonth, range.endMonth));
  if (monthsInRange.size === 0) return [];

  const { completedByMonthCat } = buildCompletedMaps(logs);

  const rows = goals
    .filter((goal) => monthsInRange.has(goal.mes))
    .map((goal) => {
      const key = `${goal.mes}|${goal.categoria}`;
      return {
        month: goal.mes,
        categoria: goal.categoria,
        titulo: goal.titulo,
        targetDays: goal.dias_target,
        achievedDays: completedByMonthCat.get(key) ?? 0,
      };
    })
    .sort((a, b) => {
      const monthCompare = a.month.localeCompare(b.month);
      if (monthCompare !== 0) return monthCompare;
      return a.categoria.localeCompare(b.categoria);
    });

  return rows;
}
