import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { revokePhotoMatches } from '../services/photos';
import type { PhotoMatchConfig, PhotoMatchResult } from '../types/photos';
import { idbStateStorage } from './storage';

interface PhotoState {
  directoryHandle: any | null; // Using any to bypass TS lib dom lack of FileSystemDirectoryHandle
  photoFiles: File[];
  matchConfig: PhotoMatchConfig;
  matches: Record<string, PhotoMatchResult>; // Key is primary key value
  
  setDirectoryHandle: (handle: any, files: File[]) => void;
  setMatchConfig: (config: PhotoMatchConfig) => void;
  setMatches: (matches: Record<string, PhotoMatchResult>) => void;
  clearPhotos: () => void;
}

export const usePhotoStore = create<PhotoState>()(
  persist(
    (set) => ({
      directoryHandle: null,
      photoFiles: [],
      matchConfig: {
        matchField: '',
        filenamePattern: '{{match_field}}',
        recursiveSearch: false
      },
      matches: {},

      setDirectoryHandle: (handle, files) => set({ directoryHandle: handle, photoFiles: files }),
      setMatchConfig: (config) => set({ matchConfig: config }),

      setMatches: (matches) => set((state) => {
        revokePhotoMatches(state.matches);
        return { matches };
      }),
      clearPhotos: () => set((state) => {
        revokePhotoMatches(state.matches);
        return { directoryHandle: null, photoFiles: [], matches: {} };
      })
    }),
    {
      name: 'id-card-photo-storage',
      storage: idbStateStorage,
      partialize: (state) => ({
        // We cannot persist `File` objects directly in a meaningful way that survives reload
        // without requesting directory permission again.
        directoryHandle: state.directoryHandle,
        matchConfig: state.matchConfig,
        matches: state.matches,
      }) as any,
    }
  )
);
