import { buildBaseShape, Coordinate, IShapeBase } from '@renderer/core/geometry/Shape';

export type Rectangle = IShapeBase & {
  type: 'rectangle';
  width: number;
  height: number;
};

export const Rectangle = {
  build,
  generateAnchorCoordinates,
};

export function build(attrs: Partial<Rectangle>): Rectangle {
  const rectangle: Rectangle = {
    type: 'rectangle',
    width: 100,
    height: 50,
    ...buildBaseShape(),
    ...attrs,
  };

  return rectangle;
}

export function generateAnchorCoordinates(rectangle: Rectangle): Coordinate[] {
  const { x, y, width, height } = rectangle;

  return [
    { x: x + width / 2, y: y }, // top center
    { x: x + width, y: y + height / 2 }, // middle right
    { x: x + width / 2, y: y + height }, // bottom center
    { x: x, y: y + height / 2 }, // middle left
  ];
}
