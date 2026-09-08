import { create } from 'zustand';
import type { Dataset } from '../types/dataset';

interface DatasetState {
  dataset: Dataset | null;
  primaryKeyField: string | null;
  
  setDataset: (dataset: Dataset) => void;
  setPrimaryKeyField: (field: string) => void;
  clearDataset: () => void;
}

export const useDatasetStore = create<DatasetState>((set) => ({
  dataset: null,
  primaryKeyField: null,

  setDataset: (dataset) => set({ dataset }),
  setPrimaryKeyField: (field) => set({ primaryKeyField: field }),
  clearDataset: () => set({ dataset: null, primaryKeyField: null })
}));
