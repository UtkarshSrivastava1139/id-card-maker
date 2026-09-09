export async function selectLocalFolder(): Promise<{ handle: any | null; files: File[] }> {
  try {
    // Try modern File System Access API
    if ('showDirectoryPicker' in window) {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker();
      return { handle: dirHandle, files: [] }; // The files will be scanned later
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err; // User cancelled
    console.warn("showDirectoryPicker failed, falling back", err);
  }

  // Fallback to hidden input
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.webkitdirectory = true;
    // @ts-ignore
    input.directory = true;
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files);
        resolve({ handle: null, files });
      } else {
        reject(new Error("No files selected"));
      }
    };
    
    input.onerror = (err) => reject(err);
    
    input.click();
  });
}

export async function savePhotoToDirectory(
  directoryHandle: any, 
  filename: string, 
  blob: Blob
): Promise<File> {
  if (directoryHandle && !directoryHandle.fallback) {
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
