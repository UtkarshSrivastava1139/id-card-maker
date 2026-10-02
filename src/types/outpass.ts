/**
 * Outpass Design Types
 *
 * Central type definitions for the Outpass Generator module.
 * These types are derived from the actual asset inventory audit.
 */

export type OutpassSchool = 'SRDIC' | 'SRDCA';

export type OutpassDesignType = 'standard' | 'supplementary';

export type OutpassOrientation = 'landscape' | 'portrait';

/**
 * A named design variant corresponds to a folder under the school's asset directory.
 * For example: "Landscape design 1", "Landscape Design 2", "Portrait Design 1", etc.
 */
export interface OutpassDesignVariant {
  id: string;                     // e.g., "srdic-landscape-design-1"
  school: OutpassSchool;
  name: string;                   // Human-readable, e.g., "Landscape Design 1"
  folderPath: string;             // Relative asset path
  orientation: OutpassOrientation;
}

/**
 * A single outpass design representing one physical outpass card asset.
 */
export interface OutpassDesign {
  id: string;                     // Unique ID, e.g., "srdic-ld1-6-a-1"
  school: OutpassSchool;
  designVariantId: string;        // References OutpassDesignVariant.id
  className: string;              // e.g., "6", "10", "LKG", "NUR", "UKG"
  section: string;                // e.g., "A", "B", "C", "AB"
  outpassNumber: number;          // 1, 2, 3
  type: OutpassDesignType;
  filename: string;               // Original filename, e.g., "6a1.png"
  assetPath: string;              // Full import path / URL
  orientation: OutpassOrientation;
  warnings: string[];             // Any parsing warnings
}

/**
 * A selection entry for PDF generation — design + quantity.
 */
export interface OutpassSelectionEntry {
  designId: string;
  quantity: number;
}

/**
 * Filter/query parameters for the design registry.
 */
export interface OutpassQuery {
  school?: OutpassSchool;
  designVariantId?: string;
  className?: string;
  section?: string;
  outpassNumber?: number;
  type?: OutpassDesignType;
  searchTerm?: string;
}
