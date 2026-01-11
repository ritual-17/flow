import { ShapeId } from '@renderer/core/geometry/Shape';

export interface Editor {
  mode: Mode;
  selectedShapeIds: ShapeId[];
  cursorPosition: { x: number; y: number };
  commandBuffer: string;
  commandHistory: string[];
}

export type Mode = 'insert' | 'normal' | 'visual' | 'command';
