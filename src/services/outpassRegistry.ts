/**
 * Outpass Design Registry
 *
 * Auto-discovers all outpass design assets at build time via Vite's import.meta.glob.
 * Parses filenames using multiple naming convention parsers.
 * Produces a queryable, validated registry of OutpassDesign entries.
 *
 * This is the single source of truth for outpass designs.
 * The UI reads from this registry — never from hardcoded lists.
 */

import type {
  OutpassDesign,
  OutpassDesignVariant,
  OutpassSchool,
  OutpassDesignType,
  OutpassOrientation,
  OutpassQuery,
} from '../types/outpass';

// ---------------------------------------------------------------------------
// 1. Design Variant Definitions (derived from the asset audit)
// ---------------------------------------------------------------------------

const DESIGN_VARIANTS: OutpassDesignVariant[] = [
  {
    id: 'srdic-landscape-1',
    school: 'SRDIC',
    name: 'Landscape Design 1',
    folderPath: 'SRDIC/Landscape design 1',
    orientation: 'landscape',
  },
  {
    id: 'srdic-landscape-2',
    school: 'SRDIC',
    name: 'Landscape Design 2',
    folderPath: 'SRDIC/Landscape Design 2',
    orientation: 'landscape',
  },
  {
    id: 'srdic-landscape-3',
    school: 'SRDIC',
    name: 'Landscape Design 3',
    folderPath: 'SRDIC/Landscape Design 3',
    orientation: 'landscape',
  },
  {
    id: 'srdic-portrait-1',
    school: 'SRDIC',
    name: 'Portrait Design 1',
    folderPath: 'SRDIC/Portrait Design 1',
    orientation: 'portrait',
  },
  {
    id: 'srdca-design-1',
    school: 'SRDCA',
    name: 'Design 1',
    folderPath: '../assets/Outpass/SRDCA Landscapes/Design 1',
    orientation: 'landscape',
  },
  {
    id: 'srdca-design-2',
    school: 'SRDCA',
    name: 'Design 2',
    folderPath: '../assets/Outpass/SRDCA Landscapes/Design 2',
    orientation: 'landscape',
  },
];

// ---------------------------------------------------------------------------
// 2. Filename Parsers
// ---------------------------------------------------------------------------

interface ParsedOutpass {
  className: string;
  section: string;
  outpassNumber: number;
  type: OutpassDesignType;
  warnings: string[];
}

/**
 * Standard compact parser: "6a1.png", "10b2.png", "7ab2.png"
 * Handles both lowercase and uppercase: "6A1.png", "11A-1.png"
 */
function parseCompactName(basename: string): ParsedOutpass | null {
  // Remove optional hyphens: "11A-1" → "11A1"
  const clean = basename.replace(/-/g, '');

  // Pattern: (class)(section)(outpass#)
  // Class: 1-2 digits, Section: 1-3 letters, Outpass: 1+ digits
  const match = clean.match(/^(\d{1,2})([a-zA-Z]{1,3})(\d+)$/);
  if (!match) return null;

  const className = match[1];
  const section = match[2].toUpperCase();
  const outpassNumber = parseInt(match[3], 10);
  const warnings: string[] = [];

  if (basename.includes('-')) {
    warnings.push(`Hyphenated filename: ${basename}`);
  }
  if (section.length > 1) {
    warnings.push(`Multi-character section "${section}" in ${basename}`);
  }

  return {
    className,
    section,
    outpassNumber,
    type: 'standard',
    warnings,
  };
}

/**
 * SRDCA "s" prefix parser: "s6a1.jpg", "sLKGA1.jpg", "SukgA1.png"
 * The leading "s"/"S" is a school marker, not part of the class.
 */
function parseSrdcaName(basename: string): ParsedOutpass | null {
  // Must start with s/S
  if (!/^s/i.test(basename)) return null;

  const body = basename.substring(1); // strip leading 's'

  // Special classes: LKG, UKG, NUR
  const specialMatch = body.match(/^(LKG|UKG|NUR)([a-zA-Z])(\d+)$/i);
  if (specialMatch) {
    return {
      className: specialMatch[1].toUpperCase(),
      section: specialMatch[2].toUpperCase(),
      outpassNumber: parseInt(specialMatch[3], 10),
      type: 'standard',
      warnings: [],
    };
  }

  // Numeric classes: s6a1, s1a2
  const numMatch = body.match(/^(\d{1,2})([a-zA-Z])(\d+)$/);
  if (numMatch) {
    return {
      className: numMatch[1],
      section: numMatch[2].toUpperCase(),
      outpassNumber: parseInt(numMatch[3], 10),
      type: 'standard',
      warnings: [],
    };
  }

  return null;
}

/**
 * Human-readable "Nth" parser: "6th A.jpg", "10th B2.jpg", "9th A 2.jpg"
 */
function parseHumanReadableName(basename: string): ParsedOutpass | null {
  // Pattern: {class}th {Section}[ {outpass}]
  // "6th A" → class=6, section=A, outpass=1
  // "6th A 2" → class=6, section=A, outpass=2
  // "10th B2" → class=10, section=B, outpass=2
  const match = basename.match(/^(\d{1,2})(?:th|st|nd|rd)\s+([A-Za-z])\s*(\d*)$/i);
  if (!match) return null;

  const className = match[1];
  const section = match[2].toUpperCase();
  const outpassNumber = match[3] ? parseInt(match[3], 10) : 1;
  const warnings: string[] = [];

  if (!match[3]) {
    warnings.push(`No outpass number in "${basename}", defaulting to 1`);
  }

  return {
    className,
    section,
    outpassNumber,
    type: 'standard',
    warnings,
  };
}

/**
 * Supplementary file parser: "s1.jpg", "s2.jpg" (no class/section)
 * These are standalone supplementary outpasses in SRDIC Portrait Design 1.
 */
function parseSupplementaryName(basename: string): ParsedOutpass | null {
  const match = basename.match(/^s(\d+)$/i);
  if (!match) return null;

  return {
    className: 'SUPP',
    section: '-',
    outpassNumber: parseInt(match[1], 10),
    type: 'supplementary',
    warnings: [`Supplementary file: ${basename}`],
  };
}

// ---------------------------------------------------------------------------
// 3. Glob-based Asset Discovery
// ---------------------------------------------------------------------------

// Eagerly import all outpass assets at build time.
// Vite resolves these globs at compile time, returning the mapped URL for each file.
const srdic_ld1 = import.meta.glob('../assets/Outpass/SRDIC/Landscape design 1/*.*', { eager: true, import: 'default' }) as Record<string, string>;
const srdic_ld2 = import.meta.glob('../assets/Outpass/SRDIC/Landscape Design 2/*.*', { eager: true, import: 'default' }) as Record<string, string>;
const srdic_ld3 = import.meta.glob('../assets/Outpass/SRDIC/Landscape Design 3/*.*', { eager: true, import: 'default' }) as Record<string, string>;
const srdic_pd1 = import.meta.glob('../assets/Outpass/SRDIC/Portrait Design 1/*.*', { eager: true, import: 'default' }) as Record<string, string>;
const srdca_d1 = import.meta.glob('../assets/Outpass/SRDCA Landscapes/Design 1/*.*', { eager: true, import: 'default' }) as Record<string, string>;
const srdca_d2 = import.meta.glob('../assets/Outpass/SRDCA Landscapes/Design 2/*.*', { eager: true, import: 'default' }) as Record<string, string>;

// Map each variant ID to its glob result.
const GLOB_MAP: Record<string, Record<string, string>> = {
  'srdic-landscape-1': srdic_ld1,
  'srdic-landscape-2': srdic_ld2,
  'srdic-landscape-3': srdic_ld3,
  'srdic-portrait-1': srdic_pd1,
  'srdca-design-1': srdca_d1,
  'srdca-design-2': srdca_d2,
};

// ---------------------------------------------------------------------------
// 4. Registry Builder
// ---------------------------------------------------------------------------

function buildDesignFromFile(
  variantId: string,
  school: OutpassSchool,
  orientation: OutpassOrientation,
  filePath: string,
  resolvedUrl: string
): OutpassDesign | null {
  // Extract filename without extension
  const parts = filePath.split('/');
  const fullFilename = parts[parts.length - 1];
  const lastDot = fullFilename.lastIndexOf('.');
  const basename = lastDot > 0 ? fullFilename.substring(0, lastDot) : fullFilename;
  const ext = lastDot > 0 ? fullFilename.substring(lastDot + 1).toLowerCase() : '';

  // Validate supported image format
  if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    console.warn(`[OutpassRegistry] Unsupported format: ${fullFilename}`);
    return null;
  }

  // Try parsers in order of specificity
  let parsed: ParsedOutpass | null = null;

  if (school === 'SRDCA') {
    parsed = parseSrdcaName(basename);
  }

  if (!parsed && variantId === 'srdic-landscape-3') {
    parsed = parseHumanReadableName(basename);
  }

  if (!parsed) {
    parsed = parseSupplementaryName(basename);
  }

  if (!parsed) {
    parsed = parseCompactName(basename);
  }

  if (!parsed) {
    console.warn(`[OutpassRegistry] Could not parse filename: ${fullFilename} in variant ${variantId}`);
    return null;
  }

  const id = `${variantId}-${parsed.className}-${parsed.section}-${parsed.outpassNumber}`.toLowerCase();

  return {
    id,
    school,
    designVariantId: variantId,
    className: parsed.className,
    section: parsed.section,
    outpassNumber: parsed.outpassNumber,
    type: parsed.type,
    filename: fullFilename,
    assetPath: resolvedUrl,
    orientation,
    warnings: parsed.warnings,
  };
}

// ---------------------------------------------------------------------------
// 5. The Registry Class
// ---------------------------------------------------------------------------

class OutpassDesignRegistry {
  private designs: OutpassDesign[] = [];
  private variants: OutpassDesignVariant[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    this.variants = [...DESIGN_VARIANTS];

    for (const variant of this.variants) {
      const globEntries = GLOB_MAP[variant.id];
      if (!globEntries) {
        console.warn(`[OutpassRegistry] No glob entries for variant ${variant.id}`);
        continue;
      }

      for (const [filePath, resolvedUrl] of Object.entries(globEntries)) {
        const design = buildDesignFromFile(
          variant.id,
          variant.school,
          variant.orientation,
          filePath,
          resolvedUrl
        );
        if (design) {
          // Check for duplicate IDs and make unique
          if (this.designs.some(d => d.id === design.id)) {
            design.id = `${design.id}-${Math.random().toString(36).substring(2, 6)}`;
            design.warnings.push(`Duplicate ID detected, appended suffix`);
          }
          this.designs.push(design);
        }
      }
    }

    this.initialized = true;

    // Log warnings
    const withWarnings = this.designs.filter(d => d.warnings.length > 0);
    if (withWarnings.length > 0) {
      console.group('[OutpassRegistry] Asset Warnings');
      withWarnings.forEach(d => {
        console.warn(`  ${d.filename}: ${d.warnings.join(', ')}`);
      });
      console.groupEnd();
    }

    console.log(`[OutpassRegistry] Loaded ${this.designs.length} designs across ${this.variants.length} variants`);
  }

  // ---------------------------------------------------------------------------
  // Query API
  // ---------------------------------------------------------------------------

  /** Get all design variants. */
  getVariants(): OutpassDesignVariant[] {
    return [...this.variants];
  }

  /** Get variants for a specific school. */
  getVariantsBySchool(school: OutpassSchool): OutpassDesignVariant[] {
    return this.variants.filter(v => v.school === school);
  }

  /** Get a single variant by ID. */
  getVariantById(id: string): OutpassDesignVariant | undefined {
    return this.variants.find(v => v.id === id);
  }

  /** Get all designs. */
  getAllDesigns(): OutpassDesign[] {
    return [...this.designs];
  }

  /** Get a single design by ID. */
  getDesignById(id: string): OutpassDesign | undefined {
    return this.designs.find(d => d.id === id);
  }

  /** Query designs with filtering. */
  queryDesigns(query: OutpassQuery): OutpassDesign[] {
    let results = this.designs;

    if (query.school) {
      results = results.filter(d => d.school === query.school);
    }
    if (query.designVariantId) {
      results = results.filter(d => d.designVariantId === query.designVariantId);
    }
    if (query.className) {
      results = results.filter(d => d.className === query.className);
    }
    if (query.section) {
      results = results.filter(d => d.section === query.section);
    }
    if (query.outpassNumber !== undefined) {
      results = results.filter(d => d.outpassNumber === query.outpassNumber);
    }
    if (query.type) {
      results = results.filter(d => d.type === query.type);
    }
    if (query.searchTerm) {
      const term = query.searchTerm.toLowerCase();
      results = results.filter(d =>
        d.filename.toLowerCase().includes(term) ||
        d.className.toLowerCase().includes(term) ||
        d.section.toLowerCase().includes(term) ||
        d.id.toLowerCase().includes(term)
      );
    }

    return results;
  }

  /** Get distinct classes available for a school + optional variant filter. */
  getAvailableClasses(school: OutpassSchool, variantId?: string): string[] {
    const filtered = this.designs.filter(d =>
      d.school === school &&
      (!variantId || d.designVariantId === variantId)
    );
    const classSet = new Set(filtered.map(d => d.className));

    // Sort: numeric first (ascending), then alphabetic (LKG, NUR, UKG)
    return Array.from(classSet).sort((a, b) => {
      const aNum = parseInt(a, 10);
      const bNum = parseInt(b, 10);
      const aIsNum = !isNaN(aNum);
      const bIsNum = !isNaN(bNum);

      if (aIsNum && bIsNum) return aNum - bNum;
      if (aIsNum) return -1;
      if (bIsNum) return 1;
      return a.localeCompare(b);
    });
  }

  /** Get distinct sections available for a school + class + optional variant. */
  getAvailableSections(school: OutpassSchool, className: string, variantId?: string): string[] {
    const filtered = this.designs.filter(d =>
      d.school === school &&
      d.className === className &&
      d.type === 'standard' &&
      (!variantId || d.designVariantId === variantId)
    );
    const sectionSet = new Set(filtered.map(d => d.section));
    return Array.from(sectionSet).sort();
  }

  /** Get distinct outpass numbers available for a school + class + section + optional variant. */
  getAvailableOutpassNumbers(school: OutpassSchool, className: string, section: string, variantId?: string): number[] {
    const filtered = this.designs.filter(d =>
      d.school === school &&
      d.className === className &&
      d.section === section &&
      d.type === 'standard' &&
      (!variantId || d.designVariantId === variantId)
    );
    const numSet = new Set(filtered.map(d => d.outpassNumber));
    return Array.from(numSet).sort((a, b) => a - b);
  }

  /** Get supplementary designs for a school + optional variant. */
  getSupplementaryDesigns(school: OutpassSchool, variantId?: string): OutpassDesign[] {
    return this.designs.filter(d =>
      d.school === school &&
      d.type === 'supplementary' &&
      (!variantId || d.designVariantId === variantId)
    );
  }

  /** Get total count of designs. */
  getTotalCount(): number {
    return this.designs.length;
  }

  /** Get designs with warnings (for developer/debug view). */
  getDesignsWithWarnings(): OutpassDesign[] {
    return this.designs.filter(d => d.warnings.length > 0);
  }
}

// Singleton instance
export const outpassRegistry = new OutpassDesignRegistry();
