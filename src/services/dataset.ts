import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { Dataset, DatasetRecord } from '../types/dataset';

export async function parseCSV(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    Papa.parse<DatasetRecord>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length && results.data.length === 0) {
          reject(new Error(results.errors[0].message));
        } else {
          resolve({
            headers: results.meta.fields || [],
            records: results.data
          });
        }
      },
      error: (err) => reject(err)
    });
  });
}

export async function parseXLSX(file: File): Promise<Dataset> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const records = XLSX.utils.sheet_to_json<DatasetRecord>(worksheet, { defval: '' });
  
  if (records.length === 0) {
    return { headers: [], records: [] };
  }

  const headers = Object.keys(records[0]);
  return { headers, records };
}

export async function parseDatasetFile(file: File): Promise<Dataset> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'csv') {
    return parseCSV(file);
  } else if (['xlsx', 'xls'].includes(extension || '')) {
    return parseXLSX(file);
  } else {
    throw new Error('Unsupported file format. Please upload CSV or Excel.');
  }
}

export function validatePrimaryKey(dataset: Dataset, pkField: string): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  dataset.records.forEach((record, index) => {
    const val = record[pkField];
    if (val === undefined || val === null || String(val).trim() === '') {
      issues.push(`Row ${index + 1}: Empty primary key.`);
    } else {
      const strVal = String(val).trim();
      if (seen.has(strVal)) {
        issues.push(`Duplicate primary key found: "${strVal}"`);
      }
      seen.add(strVal);
    }
  });
  
  return issues;
}
