import { Coordinate, Shape } from '@renderer/core/geometry/Shape';

export const LocationResolver = {
  resolveImagePosition,
};

export function resolveImagePosition(
  shape: Shape,
  imageDimensions?: { width: number; height: number },
  center?: Coordinate,
) {
  if (shape.type === 'textBox') {
    return { x: shape.x, y: shape.y };
  }

  const dimensions = imageDimensions ?? shape.label.compiledImageMeta;

  if (!dimensions) {
    throw new Error('Cannot resolve image position without image dimensions');
  }

  const { width: labelWidth, height: labelHeight } = dimensions;
  const shapeCenter = center || getCenterCoordinate(shape);
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
    case 'rectangle':
      return { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
    case 'square':
      return { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
    default:
      return { x: shape.x, y: shape.y };
  }
}
