import QRCode from 'qrcode';
import type { TemplateElement } from '../types/template';
import type { ProjectConfig } from '../types/project';

const PIXELS_PER_MM = 11.811; // ~300 DPI for high quality

export interface RenderOptions {
  record: any;
  photoFile: File | null;
  backgroundImage: string | null;
  elements: TemplateElement[];
  cardConfig: ProjectConfig;
  scale?: number;
}

function loadImage(src: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    if (src instanceof File) {
      img.src = URL.createObjectURL(src);
    } else {
      img.src = src;
    }
  });
}

function resolveText(template: string, record: any): string {
  if (!template) return '';
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    return record[key.trim()] !== undefined ? String(record[key.trim()]) : '';
  });
}

export async function renderCard(options: RenderOptions): Promise<HTMLCanvasElement> {
  const { record, photoFile, backgroundImage, elements, cardConfig, scale = 1 } = options;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const rawWidthPx = cardConfig.cardSize.width * PIXELS_PER_MM * scale;
  const rawHeightPx = cardConfig.cardSize.height * PIXELS_PER_MM * scale;

  const isLandscape = cardConfig.orientation === 'landscape';
  canvas.width = isLandscape ? Math.max(rawWidthPx, rawHeightPx) : Math.min(rawWidthPx, rawHeightPx);
  canvas.height = isLandscape ? Math.min(rawWidthPx, rawHeightPx) : Math.max(rawWidthPx, rawHeightPx);

  // 1. Draw Background
  if (backgroundImage) {
    try {
      const bgImg = await loadImage(backgroundImage);
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } catch (e) {
      console.error('Failed to load background image', e);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 2. Draw Elements
  for (const el of elements) {
    const x = el.x * PIXELS_PER_MM * scale;
    const y = el.y * PIXELS_PER_MM * scale;
    const w = el.width * PIXELS_PER_MM * scale;
    const h = el.height * PIXELS_PER_MM * scale;

    ctx.save();
    
    if (el.angle) {
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.translate(cx, cy);
      ctx.rotate((el.angle * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }
    
    if (el.type === 'photo') {
      if (photoFile) {
        try {
          const img = await loadImage(photoFile);
          const radius = (el.borderRadius || 0) * PIXELS_PER_MM * scale;
          
          ctx.beginPath();
          if (radius > 0) {
            ctx.roundRect(x, y, w, h, radius);
          } else {
            ctx.rect(x, y, w, h);
          }
          ctx.clip();

          // object-fit: cover
          const imgRatio = img.width / img.height;
          const boxRatio = w / h;
          let drawWidth = w;
          let drawHeight = h;
          let offsetX = 0;
          let offsetY = 0;

          if (imgRatio > boxRatio) {
            drawWidth = h * imgRatio;
            offsetX = -(drawWidth - w) / 2;
          } else {
            drawHeight = w / imgRatio;
            offsetY = -(drawHeight - h) / 2;
          }

          ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
        } catch (e) {
          console.error('Failed to load photo for rendering', e);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(x, y, w, h);
        }
      } else {
         ctx.fillStyle = '#e2e8f0';
         ctx.fillRect(x, y, w, h);
      }
    } else if (el.type === 'text') {
      let text = resolveText(el.content || '', record);
      if ((el as any).uppercase) {
        text = text.toUpperCase();
      }
      
      // Clip text to bounding box
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      
      // 1 pt = 1/72 inch = 0.352777 mm
      const ptToMm = 0.352777;
      const fontSizePx = (el.fontSize || 12) * ptToMm * PIXELS_PER_MM * scale; 
      
      ctx.font = `${(el as any).weight || 'normal'} ${fontSizePx}px ${(el as any).fontFamily || 'Inter'}`;
      ctx.fillStyle = (el as any).color || '#000000';
      ctx.textAlign = ((el as any).align as CanvasTextAlign) || 'left';
      ctx.textBaseline = 'top';

      let textX = x;
      if (ctx.textAlign === 'center') textX = x + w / 2;
      if (ctx.textAlign === 'right') textX = x + w;

      const paragraphs = text.split('\n');
      const lineHeight = fontSizePx * (el.lineHeight || 1.2);
      const linePadding = (lineHeight - fontSizePx) / 2;
      let lineY = y + linePadding;

      for (const paragraph of paragraphs) {
        const words = paragraph.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > w && n > 0) {
            if (lineY + fontSizePx <= y + h + 1) { // +1 for tiny floating point errors
              ctx.fillText(line, textX, lineY);
            }
            line = words[n] + ' ';
            lineY += lineHeight;
          } else {
            line = testLine;
          }
        }
        if (lineY + fontSizePx <= y + h + 1) {
          ctx.fillText(line, textX, lineY);
        }
        lineY += lineHeight;
      }

    } else if (el.type === 'qrcode') {
      const qrContent = resolveText(el.content || '', record);
      if (qrContent) {
        try {
          const qrDataUrl = await QRCode.toDataURL(qrContent, { margin: 0, width: w });
          const img = await loadImage(qrDataUrl);
          ctx.drawImage(img, x, y, w, h);
        } catch (e) {
          console.error('Failed to generate QR', e);
        }
      }
    }
    ctx.restore();
  }

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, mimeType = 'image/png'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas export failed'));
    }, mimeType, 1.0);
  });
}
