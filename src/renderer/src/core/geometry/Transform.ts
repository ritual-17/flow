// Transformation utilities for shapes, e.g. rotate, scale, translate
//

import { Shape } from '@renderer/core/geometry/Shape';

import { generateId } from '../utils/id';

export function translateShape(
  shape: Shape,
  { deltaX, deltaY }: { deltaX: number; deltaY: number },
): Shape {
  return {
    ...shape,
    x: shape.x + deltaX,
    y: shape.y + deltaY,
  };
}

export function cloneShape(shape: Shape): Shape {
  return {
    ...shape,
    id: generateId(),
    anchorPoints: shape.anchorPoints.map((a) => ({
      ...a,
      ownerId: shape.id,
    })),
  };
}

export function getSelectionCenter(shapes: Shape[]): { x: number; y: number } {
  const xs = shapes.map((s) => s.x);
  const ys = shapes.map((s) => s.y);

  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}

export {};
