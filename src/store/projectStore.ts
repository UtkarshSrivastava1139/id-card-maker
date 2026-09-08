import { create } from 'zustand';
import type { Project, ProjectConfig } from '../types/project';

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

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  projects: [], // In a real app, this would load from IndexedDB on startup

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
}));
