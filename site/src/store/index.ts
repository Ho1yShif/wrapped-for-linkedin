import { create } from 'zustand';

interface AppState {
  wrappedYear: number | null;
  setWrappedYear: (year: number | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  wrappedYear: null,
  setWrappedYear: (wrappedYear: number | null) => set({ wrappedYear }),
}));
