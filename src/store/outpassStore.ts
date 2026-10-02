import { create } from 'zustand';
import type { OutpassSchool, OutpassSelectionEntry } from '../types/outpass';

interface OutpassState {
  // Browsing State
  selectedSchool: OutpassSchool;
  selectedVariantId: string | null;
  selectedClassName: string | null; // Just one class filter for simplicity, or null
  searchTerm: string;

  // Cart State (designId -> quantity)
  // If a design is not in this object, its quantity is 0.
  quantities: Record<string, number>;

  // Actions
  setSchool: (school: OutpassSchool) => void;
  setVariant: (variantId: string | null) => void;
  setClassName: (className: string | null) => void;
  setSearchTerm: (term: string) => void;
  
  // Cart Actions
  setQuantity: (designId: string, quantity: number) => void;
  addBulkToCart: (designIds: string[]) => void;
  clearCart: () => void;
  reset: () => void;
}

const initialState = {
  selectedSchool: 'SRDIC' as OutpassSchool, // Default to SRDIC immediately
  selectedVariantId: null,
  selectedClassName: null,
  searchTerm: '',
  quantities: {} as Record<string, number>,
};

export const useOutpassStore = create<OutpassState>()((set) => ({
  ...initialState,

  setSchool: (school) => set({
    selectedSchool: school,
    selectedVariantId: null,
    selectedClassName: null,
    searchTerm: '',
    // Note: We DO NOT clear the cart when changing schools, so users can queue from both schools!
  }),

  setVariant: (variantId) => set({
    selectedVariantId: variantId,
    selectedClassName: null, // Reset class when variant changes as available classes change
  }),

  setClassName: (className) => set({
    selectedClassName: className,
  }),

  setSearchTerm: (term) => set({ searchTerm: term }),

  setQuantity: (designId, quantity) => set((state) => {
    const next = { ...state.quantities };
    if (quantity <= 0) {
      delete next[designId];
    } else {
      next[designId] = quantity;
    }
    return { quantities: next };
  }),

  addBulkToCart: (designIds) => set((state) => {
    const next = { ...state.quantities };
    for (const id of designIds) {
      next[id] = (next[id] || 0) + 1;
    }
    return { quantities: next };
  }),

  clearCart: () => set({ quantities: {} }),

  reset: () => set(initialState),
}));

/**
 * Convert current store state into OutpassSelectionEntry[] for PDF generation.
 * Only designs with quantity > 0 are included.
 */
export function buildSelectionEntries(
  quantities: Record<string, number>,
  allDesignIds: string[]
): OutpassSelectionEntry[] {
  return allDesignIds
    .filter(id => (quantities[id] || 0) > 0)
    .map(id => ({
      designId: id,
      quantity: quantities[id],
    }));
}
