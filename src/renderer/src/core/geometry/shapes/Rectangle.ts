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
    width: 200,
    height: 100,
    ...buildBaseShape(),
    ...attrs,
  };

  return rectangle;
}

export function generateAnchorCoordinates(rectangle: Rectangle): Coordinate[] {
  const { x, y, width, height } = rectangle;

  return [
    { x: x, y: y - height / 2 }, // top center
    { x: x + width / 2, y: y }, // middle right
    { x: x, y: y + height / 2 }, // bottom center
    { x: x - width / 2, y: y }, // middle left
  ];
}
