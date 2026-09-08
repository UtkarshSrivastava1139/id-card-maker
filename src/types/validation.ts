export type ValidationSeverity = 'error' | 'warning' | 'success';
export type ValidationCategory = 'dataset' | 'photos' | 'template';

export interface ValidationIssue {
  id: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  message: string;
  details?: string;
  recordId?: string;
}

export interface ValidationReport {
  isValid: boolean;
  issues: ValidationIssue[];
}
