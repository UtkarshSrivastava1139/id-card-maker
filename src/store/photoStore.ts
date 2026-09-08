import { create } from 'zustand';
import type { PhotoMatchConfig, PhotoMatchResult } from '../types/photos';

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

export const usePhotoStore = create<PhotoState>((set) => ({
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
  setMatches: (matches) => set({ matches }),
  clearPhotos: () => set({ directoryHandle: null, photoFiles: [], matches: {} })
}));
