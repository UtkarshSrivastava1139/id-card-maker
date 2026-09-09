import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, ProjectConfig } from '../types/project';
import { idbStateStorage } from './storage';

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  
  createProject: (config: ProjectConfig) => void;
  loadProject: (id: string) => void;
  closeProject: () => void;
  deleteProject: (id: string) => void;
}

// Generate a simple ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      currentProject: null,
      projects: [],

      createProject: (config) => {
        const newProject: Project = {
          ...config,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
        }));
      },

      loadProject: (id) => {
        set((state) => ({
          currentProject: state.projects.find((p) => p.id === id) || null,
        }));
      },

      closeProject: () => {
        set({ currentProject: null });
      },

      deleteProject: (id) => {
        set((state) => {
          const remaining = state.projects.filter((p) => p.id !== id);
          const current = state.currentProject?.id === id ? null : state.currentProject;
          return { projects: remaining, currentProject: current };
        });
      },
    }),
    {
      name: 'id-card-project-storage',
      storage: idbStateStorage,
    }
  )
);
