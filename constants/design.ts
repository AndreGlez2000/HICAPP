/**
 * HiC design constants — category tints, foreground colors, icon names, and labels.
 * These mirror the values declared in tailwind.config.js.
 */

export type Categoria = 'alimentacion' | 'actividad' | 'sueno';

/** Background tint color per category */
export const CATEGORY_TINT: Record<Categoria, string> = {
  alimentacion: '#fef9c3',
  actividad: '#dcfce7',
  sueno: '#ede9fe',
};

/** Foreground (text/icon) color per category */
export const CATEGORY_FG: Record<Categoria, string> = {
  alimentacion: '#e87a3f',
  actividad: '#19b78e',
  sueno: '#522c45',
};

/** Lucide icon name per category */
export const CATEGORY_ICON: Record<Categoria, string> = {
  alimentacion: 'UtensilsCrossed',
  actividad: 'Bike',
  sueno: 'Moon',
};

/** Spanish display label per category */
export const CATEGORY_LABEL: Record<Categoria, string> = {
  alimentacion: 'Alimentación',
  actividad: 'Actividad',
  sueno: 'Sueño',
};

/** Brand colors (reference — use tailwind classes when possible) */
export const COLORS = {
  primary: '#522c45',
  cta: '#e87a3f',
  success: '#19b78e',
  bg: '#f8f4f6',
  surface: '#ffffff',
  muted: '#70787c',
  border: '#e2e8f0',
  ink: '#0f172a',
} as const;
