import type { BaseTemplate } from './registry';

export interface PrintSlot {
  id: string;
  x: number; // physical mm
  y: number; // physical mm
  width: number; // physical mm
  height: number; // physical mm
  rotation: number; // degrees, e.g., 0, 90, 180, 270
}

export interface PrintLayoutTemplate extends BaseTemplate {
  paperSize: 'a4' | 'letter' | 'custom';
  pageWidth: number; // physical mm
  pageHeight: number; // physical mm
  orientation: 'portrait' | 'landscape';
  addCropMarks: boolean;
  bleed: number; // physical mm
  slots: PrintSlot[];
}
