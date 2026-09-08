export interface CardDimensions {
  width: number; // in mm
  height: number; // in mm
}

export type CardOrientation = 'landscape' | 'portrait';

export interface ProjectConfig {
  name: string;
  cardSize: CardDimensions;
  orientation: CardOrientation;
}

export interface ProjectMetadata {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type Project = ProjectMetadata & ProjectConfig;
