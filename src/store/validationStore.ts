import { create } from 'zustand';
import type { ValidationReport } from '../types/validation';

interface ValidationState {
  report: ValidationReport | null;
  setReport: (report: ValidationReport) => void;
  clearReport: () => void;
}

export const useValidationStore = create<ValidationState>((set) => ({
  report: null,
  setReport: (report) => set({ report }),
  clearReport: () => set({ report: null })
}));
