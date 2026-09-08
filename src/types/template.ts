export type ElementType = 'text' | 'photo' | 'qrcode';

export interface GuideLine {
  id: string;
  axis: 'x' | 'y'; // 'x' means vertical line (x is constant), 'y' means horizontal line (y is constant)
  pos: number; // in mm
}

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number; // mm
  y: number; // mm
  width: number; // mm
  height: number; // mm
  zIndex: number;
  angle?: number; // degrees (0, 90, 180, 270)
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string; // Supports mustache tags e.g. {{First Name}}
  fontFamily: string;
  fontSize: number; // pt
  color: string; // hex
  align: 'left' | 'center' | 'right';
  weight: 'normal' | 'bold';
  uppercase?: boolean;
  lineHeight?: number;
}

export interface PhotoElement extends BaseElement {
  type: 'photo';
  borderRadius: number; // mm
  borderColor?: string;
  borderWidth?: number; // mm
}

export interface QRCodeElement extends BaseElement {
  type: 'qrcode';
  content: string;
}

export type TemplateElement = TextElement | PhotoElement | QRCodeElement;
