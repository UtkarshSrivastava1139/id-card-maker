export async function savePhotoToDirectory(
  directoryHandle: any, 
  filename: string, 
  blob: Blob
): Promise<File> {
  if (directoryHandle) {
    try {
      // Use File System Access API
      const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      const file = await fileHandle.getFile();
      return file;
    } catch (err) {
      console.error("File System Access API failed, falling back to download", err);
      return fallbackDownload(filename, blob);
    }
  } else {
    // Fallback if no directory handle
    return fallbackDownload(filename, blob);
  }
}

function fallbackDownload(filename: string, blob: Blob): File {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Return a File object constructed from the Blob
  return new File([blob], filename, { type: blob.type });
}
