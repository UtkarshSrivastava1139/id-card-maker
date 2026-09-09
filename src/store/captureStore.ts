import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dataset } from '../types/dataset';
import { idbStateStorage } from './storage';

export type CaptureStatus = 'pending' | 'captured' | 'skipped' | 'error';

export interface CaptureRecord {
  recordId: string;
  fields: Record<string, any>;
  status: CaptureStatus;
  photoFilename?: string;
  capturedAt?: string;
}

interface CaptureState {
  dataset: Dataset | null;
  primaryKeyField: string;
  directoryHandle: any | null; // FileSystemDirectoryHandle
  records: CaptureRecord[];
  selectedDeviceId?: string;
  
  // Actions
  initSession: (dataset: Dataset, primaryKeyField: string) => void;
  setDirectoryHandle: (handle: any) => void;
  setSelectedDeviceId: (deviceId: string) => void;
  updateRecordStatus: (recordId: string, status: CaptureStatus, filename?: string) => void;
  clearSession: () => void;
}

export const useCaptureStore = create<CaptureState>()(
  persist(
    (set) => ({
      dataset: null,
      primaryKeyField: '',
      directoryHandle: null,
      records: [],
      selectedDeviceId: '',

      initSession: (dataset, primaryKeyField) => {
        const records = dataset.records.map((r) => ({
          recordId: String(r[primaryKeyField]),
          fields: r,
          status: 'pending' as CaptureStatus,
        }));
        set({ dataset, primaryKeyField, records });
      },

      setDirectoryHandle: (handle) => set({ directoryHandle: handle }),
      setSelectedDeviceId: (deviceId) => set({ selectedDeviceId: deviceId }),

      updateRecordStatus: (recordId, status, filename) => set((state) => ({
        records: state.records.map(r => 
          r.recordId === recordId 
            ? { ...r, status, ...(filename ? { photoFilename: filename, capturedAt: new Date().toISOString() } : {}) }
            : r
        )
      })),

      clearSession: () => set({ dataset: null, primaryKeyField: '', directoryHandle: null, records: [] })
    }),
    {
      name: 'id-card-capture-storage',
      storage: idbStateStorage,
    }
  )
);
