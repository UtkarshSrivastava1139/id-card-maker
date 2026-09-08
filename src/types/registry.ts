export type TemplateType = 'print-layout' | 'card-design';

export interface BaseTemplate {
  id: string;
  name: string;
  version: number;
  type: TemplateType;
  description?: string;
  isReadonly: boolean; // True for builtin templates from git, false for local drafts
}
