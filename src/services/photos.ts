import type { PhotoMatchConfig, PhotoMatchResult } from '../types/photos';
import type { Dataset } from '../types/dataset';

export async function scanDirectory(dirHandle: any, recursive: boolean): Promise<File[]> {
  const files: File[] = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
        files.push(file);
      }
    } else if (entry.kind === 'directory' && recursive) {
      const subFiles = await scanDirectory(entry, recursive);
      files.push(...subFiles);
    }
  }
  return files;
}

export function matchPhotos(
  dataset: Dataset, 
  photoFiles: File[], 
  config: PhotoMatchConfig, 
  pkField: string
): Record<string, PhotoMatchResult> {
  const matches: Record<string, PhotoMatchResult> = {};
  
  const fileIndex = new Map<string, File>();
  for (const file of photoFiles) {
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')).toLowerCase();
    const exactName = file.name.toLowerCase();
    fileIndex.set(nameWithoutExt, file);
    fileIndex.set(exactName, file);
  }

  dataset.records.forEach(record => {
    const pkValue = String(record[pkField] || '').trim();
    if (!pkValue) return;

    const matchValue = String(record[config.matchField] || '').trim();
    const expectedName = config.filenamePattern.replace('{{match_field}}', matchValue).toLowerCase();
    
    let matchedFile = fileIndex.get(expectedName) || null;
    
    if (!matchedFile) {
      matchedFile = fileIndex.get(`${expectedName}.jpg`) 
                 || fileIndex.get(`${expectedName}.jpeg`) 
                 || fileIndex.get(`${expectedName}.png`) 
                 || null;
    }

    let objectUrl = null;
    if (matchedFile) {
      objectUrl = URL.createObjectURL(matchedFile);
    }

    matches[pkValue] = {
      recordId: pkValue,
      file: matchedFile,
      objectUrl
    };
  });

  return matches;
}
