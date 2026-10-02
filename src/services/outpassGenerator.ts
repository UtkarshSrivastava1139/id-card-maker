/**
 * Outpass PDF Generator
 *
 * Generates print-ready PDFs by feeding outpass design images
 * into the EXISTING print layout engine (jsPDF + PrintLayoutTemplate slots).
 *
 * This module does NOT duplicate the PDF renderer. It reuses the same
 * slot-based layout, rotation, crop marks, and page dimensions from
 * the production-2x5 template (or any other PrintLayoutTemplate).
 */

import { jsPDF } from 'jspdf';
import type { PrintLayoutTemplate } from '../types/layout';
import type { OutpassDesign, OutpassSelectionEntry } from '../types/outpass';
import { outpassRegistry } from './outpassRegistry';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Expand selection entries into a flat array of designs, respecting quantity.
 *
 * e.g., [ { designId: "x", quantity: 3 } ] → [design, design, design]
 */
export function expandSelections(selections: OutpassSelectionEntry[]): OutpassDesign[] {
  const expanded: OutpassDesign[] = [];
  for (const entry of selections) {
    const design = outpassRegistry.getDesignById(entry.designId);
    if (!design) {
      console.warn(`[OutpassGenerator] Design not found: ${entry.designId}`);
      continue;
    }
    for (let i = 0; i < entry.quantity; i++) {
      expanded.push(design);
    }
  }
  return expanded;
}

/**
 * Render an outpass design image onto a canvas at the given physical card dimensions.
 */
async function renderOutpassCard(
  design: OutpassDesign,
  slotWidthMm: number,
  slotHeightMm: number,
  pixelsPerMm: number
): Promise<HTMLCanvasElement> {
  const img = await loadImage(design.assetPath);

  // The canvas is the exact physical slot size
  const canvas = document.createElement('canvas');
  canvas.width = slotWidthMm * pixelsPerMm;
  canvas.height = slotHeightMm * pixelsPerMm;

  const ctx = canvas.getContext('2d')!;

  // Draw the outpass image stretched to fill the card area.
  // The assets are pre-designed to card dimensions, so fill is correct.
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas;
}

/**
 * Generate a print-ready PDF from outpass selections using the existing
 * PrintLayoutTemplate (e.g., production-2x5).
 *
 * This mirrors the exact same slot-based rendering from generator.ts:generateBulk()
 * for the PDF path, but instead of student records + renderCard(), it uses
 * static outpass design images.
 */
export async function generateOutpassPdf(
  selections: OutpassSelectionEntry[],
  printLayout: PrintLayoutTemplate,
  onProgress: (current: number, total: number) => void,
  preview: boolean = false
): Promise<void> {
  const designs = expandSelections(selections);
  const total = designs.length;

  if (total === 0) throw new Error('No designs selected for generation.');
  if (printLayout.slots.length === 0) throw new Error('Print layout has no slots.');

  const PIXELS_PER_MM = 11.811; // 300 DPI

  const pdf = new jsPDF({
    orientation: printLayout.orientation,
    unit: 'mm',
    format: printLayout.paperSize === 'custom'
      ? [printLayout.pageWidth, printLayout.pageHeight]
      : printLayout.paperSize,
  });

  const slots = printLayout.slots;
  const cardsPerPage = slots.length;

  for (let i = 0; i < total; i++) {
    const design = designs[i];
    const indexOnPage = i % cardsPerPage;
    const slot = slots[indexOnPage];

    if (indexOnPage === 0 && i > 0) {
      pdf.addPage();
    }

    // ─── Orientation-aware rendering ───────────────────────────────────
    // The production-2x5 slots are 85.6mm × 54mm with rotation=90°.
    // This was designed for PORTRAIT cards (54w × 86h) which get rotated
    // 90° to become 86w × 54h, matching the slot.
    //
    // For LANDSCAPE outpasses (already ~86w × 54h), we skip slot rotation
    // entirely — the image already matches the slot's display dimensions.
    // For PORTRAIT outpasses, we apply the slot's rotation as usual.
    const isLandscapeDesign = design.orientation === 'landscape';

    let cardCanvas: HTMLCanvasElement;
    let finalCanvas: HTMLCanvasElement;

    if (isLandscapeDesign) {
      // Landscape: render at slot display size, skip rotation
      cardCanvas = await renderOutpassCard(design, slot.width, slot.height, PIXELS_PER_MM);
      finalCanvas = cardCanvas;
    } else {
      // Portrait: render at swapped dimensions, then rotate to fit slot
      if (slot.rotation === 90 || slot.rotation === 270) {
        cardCanvas = await renderOutpassCard(design, slot.height, slot.width, PIXELS_PER_MM);
      } else {
        cardCanvas = await renderOutpassCard(design, slot.width, slot.height, PIXELS_PER_MM);
      }

      finalCanvas = cardCanvas;
      if (slot.rotation === 90 || slot.rotation === 270) {
        const rotatedCanvas = document.createElement('canvas');
        rotatedCanvas.width = cardCanvas.height;
        rotatedCanvas.height = cardCanvas.width;
        const rctx = rotatedCanvas.getContext('2d')!;
        rctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
        rctx.rotate((slot.rotation * Math.PI) / 180);
        rctx.drawImage(cardCanvas, -cardCanvas.width / 2, -cardCanvas.height / 2);
        finalCanvas = rotatedCanvas;
      } else if (slot.rotation === 180) {
        const rotatedCanvas = document.createElement('canvas');
        rotatedCanvas.width = cardCanvas.width;
        rotatedCanvas.height = cardCanvas.height;
        const rctx = rotatedCanvas.getContext('2d')!;
        rctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
        rctx.rotate((180 * Math.PI) / 180);
        rctx.drawImage(cardCanvas, -cardCanvas.width / 2, -cardCanvas.height / 2);
        finalCanvas = rotatedCanvas;
      }
    }

    const dataUrl = finalCanvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(dataUrl, 'JPEG', slot.x, slot.y, slot.width, slot.height);

    // Crop marks (same logic as generator.ts)
    if (printLayout.addCropMarks) {
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.2);
      const l = 3;
      const x = slot.x;
      const y = slot.y;
      const cardW = slot.width;
      const cardH = slot.height;

      pdf.line(x, y - l, x, y);
      pdf.line(x - l, y, x, y);
      pdf.line(x + cardW, y - l, x + cardW, y);
      pdf.line(x + cardW + l, y, x + cardW, y);
      pdf.line(x, y + cardH + l, x, y + cardH);
      pdf.line(x - l, y + cardH, x, y + cardH);
      pdf.line(x + cardW, y + cardH + l, x + cardW, y + cardH);
      pdf.line(x + cardW + l, y + cardH, x + cardW, y + cardH);
    }

    // GC hints
    cardCanvas.width = 0;
    cardCanvas.height = 0;
    if (finalCanvas !== cardCanvas) {
      finalCanvas.width = 0;
      finalCanvas.height = 0;
    }

    onProgress(i + 1, total);

    // Yield to event loop periodically
    if (i % 10 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }

  if (preview) {
    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl, '_blank');
  } else {
    // Use jsPDF's built-in save() — it correctly sets the MIME type and
    // file extension across all browsers, unlike manual blob + anchor approaches.
    pdf.save('outpasses_print.pdf');
  }
}
