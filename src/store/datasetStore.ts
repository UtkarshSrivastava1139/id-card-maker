import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dataset } from '../types/dataset';
import { idbStateStorage } from './storage';

interface DatasetState {
  dataset: Dataset | null;
  primaryKeyField: string | null;
  
  setDataset: (dataset: Dataset) => void;
  setPrimaryKeyField: (field: string) => void;
  clearDataset: () => void;
}

export const useDatasetStore = create<DatasetState>()(
  persist(
    (set) => ({
      dataset: null,
      primaryKeyField: null,

      setDataset: (dataset) => set({ dataset }),
      setPrimaryKeyField: (field) => set({ primaryKeyField: field }),
      clearDataset: () => set({ dataset: null, primaryKeyField: null })
    }),
    {
      name: 'id-card-dataset-storage',
      storage: idbStateStorage,
    }
  )
);
