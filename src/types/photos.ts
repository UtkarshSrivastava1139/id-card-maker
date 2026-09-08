export interface PhotoMatchConfig {
  matchField: string; // The dataset column to use for matching (e.g. "Student ID")
  filenamePattern: string; // e.g. "{{match_field}}"
  recursiveSearch: boolean;
}

export interface PhotoMatchResult {
  recordId: string; // Primary Key value
  file: File | null; // The actual local file object
  objectUrl: string | null; // URL.createObjectURL(file) for rendering previews fast
}
