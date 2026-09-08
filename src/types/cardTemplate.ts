import type { BaseTemplate } from './registry';
import type { TemplateElement, GuideLine } from './template';

export interface CardDesignTemplate extends BaseTemplate {
  backgroundImage: string | null;
  elements: TemplateElement[];
  guidelines?: GuideLine[];
  width: number; // typical mm width
  height: number; // typical mm height
}
