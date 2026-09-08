import type { PrintLayoutTemplate } from '../types/layout';
import type { CardDesignTemplate } from '../types/cardTemplate';

class Registry {
  private printLayouts: Map<string, PrintLayoutTemplate> = new Map();
  private cardDesigns: Map<string, CardDesignTemplate> = new Map();

  constructor() {
    this.loadTemplates();
  }

  private loadTemplates() {
    // Load Print Layouts
    const printModules = import.meta.glob('./print-layouts/*.json', { eager: true });
    for (const path in printModules) {
      try {
        const mod = printModules[path] as { default?: PrintLayoutTemplate };
        // Handle varying bundler JSON import structures
        const template = mod.default || (mod as unknown as PrintLayoutTemplate);
        
        if (template && template.type === 'print-layout' && template.id) {
          // Force isReadonly to true for registry-loaded templates, regardless of JSON content
          template.isReadonly = true;
          this.printLayouts.set(template.id, template);
        } else {
          console.warn(`[Registry] Skipped invalid print layout at ${path}`, template);
        }
      } catch (err) {
        console.error(`[Registry] Error loading print layout ${path}`, err);
      }
    }

    // Load Card Designs
    const cardModules = import.meta.glob('./card-designs/*.json', { eager: true });
    for (const path in cardModules) {
      try {
        const mod = cardModules[path] as { default?: CardDesignTemplate };
        const template = mod.default || (mod as unknown as CardDesignTemplate);
        
        if (template && template.type === 'card-design' && template.id) {
          template.isReadonly = true;
          this.cardDesigns.set(template.id, template);
        } else {
          console.warn(`[Registry] Skipped invalid card design at ${path}`);
        }
      } catch (err) {
        console.error(`[Registry] Error loading card design ${path}`, err);
      }
    }
  }

  getPrintLayouts(): PrintLayoutTemplate[] {
    return Array.from(this.printLayouts.values());
  }

  getPrintLayoutById(id: string): PrintLayoutTemplate | undefined {
    return this.printLayouts.get(id);
  }

  getCardDesigns(): CardDesignTemplate[] {
    return Array.from(this.cardDesigns.values());
  }

  getCardDesignById(id: string): CardDesignTemplate | undefined {
    return this.cardDesigns.get(id);
  }
}

export const TemplateRegistry = new Registry();
