export interface MobileDisplayData {
  title: string;
  subtitle: string;
  details: string;
}

export interface MobileSessionRecord {
  recordId: string; // The primary key value
  displayData: MobileDisplayData;
}

export interface MobileSessionPayload {
  sessionId: string;
  projectName: string;
  primaryKeyField: string;
  records: MobileSessionRecord[];
}

export type MobileCaptureStatus = 'pending' | 'captured' | 'skipped';

export interface MobileCaptureRecord {
  recordId: string;
  status: MobileCaptureStatus;
  photoBlob: Blob | null; // Stored in IndexedDB
  photoFilename: string | null; // The exact filename it will have when exported
  capturedAt?: string;
}
