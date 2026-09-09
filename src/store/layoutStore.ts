import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PrintLayoutTemplate } from '../types/layout';
import { TemplateRegistry } from '../templates/registry';
import { idbStateStorage } from './storage';

interface LayoutState {
  templates: PrintLayoutTemplate[];
  activeTemplateId: string | null;
  addTemplate: (template: PrintLayoutTemplate) => void;
  updateTemplate: (id: string, updates: Partial<PrintLayoutTemplate>) => void;
  deleteTemplate: (id: string) => void;
  setActiveTemplate: (id: string) => void;
}

const builtInLayouts = TemplateRegistry.getPrintLayouts();

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      templates: builtInLayouts,
      activeTemplateId: builtInLayouts.length > 0 ? builtInLayouts[0].id : null,

      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, template]
      })),

      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map(t => 
          (t.id === id && !t.isReadonly) ? { ...t, ...updates } : t
        )
      })),

      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter(t => t.id !== id || t.isReadonly),
        activeTemplateId: state.activeTemplateId === id ? (builtInLayouts[0]?.id || null) : state.activeTemplateId
      })),

      setActiveTemplate: (id) => set({ activeTemplateId: id })
    }),
    {
      name: 'id-card-layout-storage',
      storage: idbStateStorage,
      merge: (persistedState: any, currentState) => {
        // Keep local drafts (isReadonly=false) from local storage
        // OVERWRITE any built-ins with the fresh ones from Git/Registry
        const localTemplates = (persistedState?.templates || []).filter((t: any) => !t.isReadonly);
        
        const allTemplates = [...builtInLayouts, ...localTemplates];
        const activeId = persistedState?.activeTemplateId;
        const finalActiveId = allTemplates.some(t => t.id === activeId) ? activeId : (builtInLayouts[0]?.id || null);

        return {
          ...currentState,
          ...persistedState,
          templates: allTemplates,
          activeTemplateId: finalActiveId
        };
      }
    }
  )
);
