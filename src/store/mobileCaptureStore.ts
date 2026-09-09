import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { idbStateStorage } from './storage';
import type { MobileSessionPayload, MobileCaptureRecord, MobileCaptureStatus } from '../types/mobile';

interface MobileCaptureState {
  sessionPayload: MobileSessionPayload | null;
  records: MobileCaptureRecord[];
  
  // Actions
  initSession: (payload: MobileSessionPayload) => void;
  updateRecordStatus: (recordId: string, status: MobileCaptureStatus, blob: Blob | null, filename: string | null) => void;
  clearSession: () => void;
}

export const useMobileCaptureStore = create<MobileCaptureState>()(
  persist(
    (set) => ({
      sessionPayload: null,
      records: [],
      
      initSession: (payload) => {
        const records = payload.records.map((r) => ({
          recordId: r.recordId,
          status: 'pending' as MobileCaptureStatus,
          photoBlob: null,
          photoFilename: null,
        }));
        set({ sessionPayload: payload, records });
      },

      updateRecordStatus: (recordId, status, blob, filename) => set((state) => ({
        records: state.records.map(r => 
          r.recordId === recordId 
            ? { ...r, status, photoBlob: blob, photoFilename: filename, capturedAt: new Date().toISOString() }
            : r
        )
      })),

      clearSession: () => set({ sessionPayload: null, records: [] })
    }),
    {
      name: 'id-card-mobile-capture-storage',
      storage: idbStateStorage,
    }
  )
);
