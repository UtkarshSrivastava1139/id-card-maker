export type DatasetRecord = Record<string, string | number | boolean | null>;

export interface Dataset {
  headers: string[];
  records: DatasetRecord[];
}

export interface FieldMapping {
  templateFieldId: string;
  datasetColumn: string;
}
