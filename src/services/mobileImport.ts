import JSZip from 'jszip';

export async function extractPhotosFromZip(zipFile: File): Promise<File[]> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(zipFile);
  
  const extractedFiles: File[] = [];

  for (const [relativePath, zipEntry] of Object.entries(contents.files)) {
    if (!zipEntry.dir) {
      // Filter out non-image files and hidden files (like __MACOSX)
      if (relativePath.includes('__MACOSX')) continue;
      
      const ext = relativePath.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
        const blob = await zipEntry.async('blob');
        const file = new File([blob], zipEntry.name.split('/').pop() || zipEntry.name, { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
        extractedFiles.push(file);
      }
    }
  }

  return extractedFiles;
}
