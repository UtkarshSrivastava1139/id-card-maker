import type { ValidationReport, ValidationIssue } from '../types/validation';
import type { Dataset } from '../types/dataset';
import type { PhotoMatchResult } from '../types/photos';
import type { TemplateElement } from '../types/template';

const generateId = () => Math.random().toString(36).substring(2, 9);

export function runFullValidation(
  dataset: Dataset | null,
  primaryKeyField: string | null,
  photoMatches: Record<string, PhotoMatchResult>,
  templateBackgroundImage: string | null,
  templateElements: TemplateElement[]
): ValidationReport {
  const issues: ValidationIssue[] = [];

  // --- 1. Dataset Validation ---
  if (!dataset || dataset.records.length === 0) {
    issues.push({ id: generateId(), category: 'dataset', severity: 'error', message: 'No dataset loaded.' });
  } else if (!primaryKeyField) {
    issues.push({ id: generateId(), category: 'dataset', severity: 'error', message: 'No primary key column selected.' });
  } else {
    // Check for empty or duplicate PKs
    const seen = new Set<string>();
    let emptyPkCount = 0;
    let duplicatePkCount = 0;

    dataset.records.forEach((record) => {
      const val = String(record[primaryKeyField] || '').trim();
      if (!val) {
        emptyPkCount++;
      } else if (seen.has(val)) {
        duplicatePkCount++;
      }
      seen.add(val);
    });

    if (emptyPkCount > 0) {
      issues.push({ id: generateId(), category: 'dataset', severity: 'error', message: `Found ${emptyPkCount} records with an empty primary key.` });
    }
    if (duplicatePkCount > 0) {
      issues.push({ id: generateId(), category: 'dataset', severity: 'error', message: `Found ${duplicatePkCount} records with duplicate primary keys.` });
    }
  }

  // --- 2. Photo Validation ---
  const expectedPhotoCount = dataset ? dataset.records.length : 0;
  const matchValues = Object.values(photoMatches);
  
  if (expectedPhotoCount > 0) {
    if (matchValues.length === 0) {
      issues.push({ id: generateId(), category: 'photos', severity: 'error', message: 'No photos connected or matched.' });
    } else {
      const missingPhotos = matchValues.filter(m => m.file === null);
      if (missingPhotos.length > 0) {
        issues.push({ 
          id: generateId(), 
          category: 'photos', 
          severity: 'error', 
          message: `${missingPhotos.length} records are missing a matched photo.`,
          details: `Missing for IDs: ${missingPhotos.slice(0, 5).map(m => m.recordId).join(', ')}${missingPhotos.length > 5 ? '...' : ''}`
        });
      }
    }
  }

  // --- 3. Template Validation ---
  if (!templateBackgroundImage) {
    issues.push({ id: generateId(), category: 'template', severity: 'error', message: 'No background template image uploaded.' });
  }

  // Check template variables against dataset headers
  if (dataset && dataset.headers.length > 0) {
    const validHeaders = new Set(dataset.headers);
    
    templateElements.forEach(el => {
      if (el.type === 'text') {
        const regex = /\{\{([^}]+)\}\}/g;
        let match;
        while ((match = regex.exec((el as any).content)) !== null) {
          const varName = match[1].trim();
          if (!validHeaders.has(varName)) {
            issues.push({
              id: generateId(),
              category: 'template',
              severity: 'error',
              message: `Template uses unknown variable '{{${varName}}}'.`,
              details: `Field '${varName}' does not exist in the dataset.`
            });
          }
        }
      }
    });
  } else if (templateElements.some(el => el.type === 'text' && /\{\{([^}]+)\}\}/.test((el as any).content))) {
    issues.push({ id: generateId(), category: 'template', severity: 'error', message: 'Template contains variables but no dataset is loaded.' });
  }

  const isValid = !issues.some(i => i.severity === 'error');

  return {
    isValid,
    issues
  };
}
