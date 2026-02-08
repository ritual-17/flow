import { Shape } from '@renderer/core/geometry/Shape';

export const LocationResolver = {
  resolveImagePosition,
};

export function resolveImagePosition(
  shape: Shape,
  imageDimensions?: { width: number; height: number },
) {
  if (shape.type === 'textBox') {
    return { x: shape.x, y: shape.y };
  }

  const { width: labelWidth, height: labelHeight } =
    imageDimensions || shape.label.compiledImageMeta!;
  const shapeCenter = getCenterCoordinate(shape);
  return {
    x: shapeCenter.x - labelWidth / 2,
    y: shapeCenter.y - labelHeight / 2,
  };
}

// gets the center of the shape.
// for something like a rectangle, it would be x + width/2, y + height/2
function getCenterCoordinate(shape: Shape) {
  switch (shape.type) {
    case 'circle':
      return { x: shape.x, y: shape.y };
    default:
      return { x: shape.x, y: shape.y };
  }
}
