import { create } from 'zustand';
import type { AnalyticsData } from '@types';
import type { ParsedExcelData } from '../utils/excel/types';

interface AppState {
  analyticsData: AnalyticsData | null;
  excelData: ParsedExcelData | null;
  loading: boolean;
  error: string | null;
  setAnalyticsData: (data: AnalyticsData) => void;
  setExcelData: (data: ParsedExcelData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  analyticsData: null,
  excelData: null,
  loading: false,
  error: null,
  setAnalyticsData: (analyticsData: AnalyticsData) => set({ analyticsData }),
  setExcelData: (excelData: ParsedExcelData) => set({ excelData }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({
    analyticsData: null,
    excelData: null,
    loading: false,
    error: null,
  }),
}));
