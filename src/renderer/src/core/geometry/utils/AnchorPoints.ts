import { AnchorPoint, Shape } from '@renderer/core/geometry/Shape';
import { generateAnchorPoints } from '@renderer/core/geometry/shapes/Circle';

export function getAnchorPoints(shape: Shape): AnchorPoint[] {
  switch (shape.type) {
    case 'circle':
      return generateAnchorPoints(shape);
    // Add cases for other shape types as needed
    default:
      return [];
  }
}
