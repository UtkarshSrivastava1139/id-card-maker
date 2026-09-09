import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { renderCard, canvasToBlob } from './renderer';

export interface GenerationSettings {
  outputFormat: 'zip' | 'pdf';
  fileFormat: 'png' | 'jpeg';
  paperSize: 'a4';
  margins: number;
  spacing: number;
  addCropMarks: boolean;
}

export async function generateBulk(
  records: any[],
  primaryKeyField: string,
  photoMatches: Record<string, { file: File | null }>,
  templateBackgroundImage: string | null,
  templateElements: any[],
  cardConfig: any,
  settings: GenerationSettings,
  printLayout: import('../types/layout').PrintLayoutTemplate | null,
  onProgress: (current: number, total: number) => void
) {
  const total = records.length;
  
  if (settings.outputFormat === 'zip') {
    const zip = new JSZip();
    
    for (let i = 0; i < total; i++) {
      const record = records[i];
      const pk = String(record[primaryKeyField] || `row_${i}`);
      const photoFile = photoMatches[pk]?.file || null;
      
      const canvas = await renderCard({
        record,
        photoFile,
        backgroundImage: templateBackgroundImage,
        elements: templateElements,
        cardConfig,
        scale: 1
      });
      
      const mime = settings.fileFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
      const blob = await canvasToBlob(canvas, mime);
      
      const ext = settings.fileFormat === 'jpeg' ? 'jpg' : 'png';
      zip.file(`card_${pk}.${ext}`, blob);
      
      // Aggressive GC hint
      canvas.width = 0;
      canvas.height = 0;

      onProgress(i + 1, total);

      // Yield to event loop to allow GC of blob construction variables
      if (i % 20 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'id_cards.zip');
    
  } else if (settings.outputFormat === 'pdf') {
    if (!printLayout) throw new Error("Print layout template is required for PDF generation.");

    // PDF size is dictated by the print layout template
    const pdf = new jsPDF({
      orientation: printLayout.orientation,
      unit: 'mm',
      format: printLayout.paperSize === 'custom' ? [printLayout.pageWidth, printLayout.pageHeight] : printLayout.paperSize
    });
    
    const slots = printLayout.slots;
    if (slots.length === 0) throw new Error("Print layout has no slots.");
    const cardsPerPage = slots.length;
    
    for (let i = 0; i < total; i++) {
      const record = records[i];
      const pk = String(record[primaryKeyField] || `row_${i}`);
      const photoFile = photoMatches[pk]?.file || null;
      
      let canvas = await renderCard({
        record,
        photoFile,
        backgroundImage: templateBackgroundImage,
        elements: templateElements,
        cardConfig,
        scale: 1 // 300 DPI for nice PDF printing
      });

      const indexOnPage = i % cardsPerPage;
      const slot = slots[indexOnPage];
      
      if (indexOnPage === 0 && i > 0) {
        pdf.addPage();
      }
      
      // Apply rotation if required by the slot
      let rotatedCanvas: HTMLCanvasElement | null = null;
      if (slot.rotation === 90 || slot.rotation === 270) {
        rotatedCanvas = document.createElement('canvas');
        rotatedCanvas.width = canvas.height;
        rotatedCanvas.height = canvas.width;
        const rctx = rotatedCanvas.getContext('2d')!;
        rctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
        rctx.rotate((slot.rotation * Math.PI) / 180);
        rctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
      } else if (slot.rotation === 180) {
        rotatedCanvas = document.createElement('canvas');
        rotatedCanvas.width = canvas.width;
        rotatedCanvas.height = canvas.height;
        const rctx = rotatedCanvas.getContext('2d')!;
        rctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
        rctx.rotate((180 * Math.PI) / 180);
        rctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
      }

      const finalCanvas = rotatedCanvas || canvas;
      
      const x = slot.x;
      const y = slot.y;
      const cardW = slot.width;
      const cardH = slot.height;
      
      const dataUrl = finalCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(dataUrl, 'JPEG', x, y, cardW, cardH);
      
      if (printLayout.addCropMarks) {
        pdf.setDrawColor(0);
        pdf.setLineWidth(0.2);
        const l = 3;
        pdf.line(x, y - l, x, y);
        pdf.line(x - l, y, x, y);
        pdf.line(x + cardW, y - l, x + cardW, y);
        pdf.line(x + cardW + l, y, x + cardW, y);
        pdf.line(x, y + cardH + l, x, y + cardH);
        pdf.line(x - l, y + cardH, x, y + cardH);
        pdf.line(x + cardW, y + cardH + l, x + cardW, y + cardH);
        pdf.line(x + cardW + l, y + cardH, x + cardW, y + cardH);
      }
      
      // Aggressive GC hints
      canvas.width = 0;
      canvas.height = 0;
      if (rotatedCanvas) {
        rotatedCanvas.width = 0;
        rotatedCanvas.height = 0;
      }

      onProgress(i + 1, total);

      // Yield to event loop to allow GC of large image data URLs
      if (i % 20 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }
    
    pdf.save('id_cards_print.pdf');
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
