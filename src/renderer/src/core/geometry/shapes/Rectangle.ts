import { AnchorPoint, buildBaseShape, IShapeBase } from '@renderer/core/geometry/Shape';

export type Rectangle = IShapeBase & {
  type: 'rectangle';
  width: number;
  height: number;
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

export function generateAnchorPoints(rectangle: Rectangle): AnchorPoint[] {
  const { x, y, width, height } = rectangle;
  const ownerId = rectangle.id;

  return [
    { ownerId, position: 0, x: x + width / 2, y: y }, // top center
    { ownerId, position: 1, x: x + width, y: y + height / 2 }, // middle right
    { ownerId, position: 2, x: x + width / 2, y: y + height }, // bottom center
    { ownerId, position: 3, x: x, y: y + height / 2 }, // middle left
  ];
}
