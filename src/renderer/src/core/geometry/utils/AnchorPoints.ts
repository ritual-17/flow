import { Shape } from '@renderer/core/geometry/Shape';
import { generateAnchorPoints } from '@renderer/core/geometry/shapes/Circle';

export function getAnchorPoints(shape: Shape): { x: number; y: number }[] {
  switch (shape.type) {
    case 'circle':
      return generateAnchorPoints(shape);
    // Add cases for other shape types as needed
    default:
      return [];
  }
}
