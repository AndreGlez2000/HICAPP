import { create } from 'zustand';
import { deleteDatabase, initDB } from '../db';
import { getUser, upsertUser, type UserRow } from '../db/user';
import { getGoals, upsertGoal, type GoalRow } from '../db/goals';
import { getMiDiaLog, toggleMiDia as dbToggleMiDia, type MiDiaRow } from '../db/miDia';
import { getPhotos, insertPhoto, type PhotoRow } from '../db/photos';

export type Categoria = 'alimentacion' | 'actividad' | 'sueno';

export type User = UserRow;
export type Goal = GoalRow;
export type MiDiaEntry = MiDiaRow;
export type Photo = PhotoRow;

export interface NavigationContext {
  goalId?: number;
  photoId?: number;
  modalMessage?: string;
}

interface HicStore {
  // State
  user: User | null;
  goals: Goal[];
  miDiaLog: MiDiaEntry[];
  photos: Photo[];
  navigationContext: NavigationContext;
  isHydrated: boolean;

  // Hydration
  loadFromDB: () => Promise<void>;

  // User actions
  setUser: (data: Partial<Omit<User, 'id'>>) => Promise<void>;
  clearUser: () => void;
  resetApp: () => Promise<void>;

  // Goals actions
  setGoals: (goals: Goal[]) => void;
  renewGoal: (goalId: number, titulo: string, diasTarget: number, mes: string) => Promise<void>;

  // Mi Día actions
  setMiDiaLog: (entries: MiDiaEntry[]) => void;
  toggleMiDia: (fecha: string, categoria: Categoria) => Promise<void>;

  // Photos actions
  setPhotos: (photos: Photo[]) => void;
  addPhoto: (photo: Omit<Photo, 'id'>) => Promise<void>;

  // Navigation context
  setNavigationContext: (ctx: Partial<NavigationContext>) => void;
  clearNavigationContext: () => void;
}

export const useHicStore = create<HicStore>((set, get) => ({
  // Initial state
  user: null,
  goals: [],
  miDiaLog: [],
  photos: [],
  navigationContext: {},
  isHydrated: false,

  // Hydration: reads all tables from SQLite and populates store
  loadFromDB: async () => {
    const [user, goals, miDiaLog, photos] = await Promise.all([
      getUser(),
      getGoals(),
      getMiDiaLog(),
      getPhotos(),
    ]);
    set({ user, goals, miDiaLog, photos, isHydrated: true });
  },

  // User
  setUser: async (data) => {
    await upsertUser(data);
    const updated = await getUser();
    set({ user: updated });
  },
  clearUser: () => set({ user: null }),
  resetApp: async () => {
    await deleteDatabase();
    set({ user: null, goals: [], miDiaLog: [], photos: [], isHydrated: false });
    await initDB();
    await get().loadFromDB();
  },

  // Goals
  setGoals: (goals) => set({ goals }),
  renewGoal: async (goalId, titulo, diasTarget, mes) => {
    await upsertGoal({ id: goalId, titulo, dias_target: diasTarget, count_mes: 0, mes });
    const updated = await getGoals();
    set({ goals: updated });
  },

  // Mi Día
  setMiDiaLog: (entries) => set({ miDiaLog: entries }),
  toggleMiDia: async (fecha, categoria) => {
    await dbToggleMiDia(fecha, categoria);
    const updated = await getMiDiaLog();
    set({ miDiaLog: updated });
  },

  // Photos
  setPhotos: (photos) => set({ photos }),
  addPhoto: async (photo) => {
    await insertPhoto(photo);
    const updated = await getPhotos();
    set({ photos: updated });
  },

  // Navigation context (ephemeral — not persisted to SQLite)
  setNavigationContext: (ctx) =>
    set((state) => ({
      navigationContext: { ...state.navigationContext, ...ctx },
    })),
  clearNavigationContext: () => set({ navigationContext: {} }),
}));
