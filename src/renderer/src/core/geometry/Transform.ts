// Transformation utilities for shapes, e.g. rotate, scale, translate
//

import { Shape } from '@renderer/core/geometry/Shape';

// this is done this way so the data stays immutable
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

export {};
