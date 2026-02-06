import { AnchorPoint, buildBaseShape, IShapeBase } from '@renderer/core/geometry/Shape';

export type Circle = IShapeBase & {
  type: 'circle';
  radius: number;
};

export function build(attrs: Partial<Circle>): Circle {
  const circle: Circle = {
    type: 'circle',
    radius: 50,
    ...buildBaseShape(),
    ...attrs,
  };

  return circle;
}

export function generateAnchorPoints(circle: Circle): AnchorPoint[] {
  const { x, y, radius } = circle;
  const ownerId = circle.id;

  return [
    { position: 0, ownerId, x, y: y - radius }, // top
    { position: 1, ownerId, x: x + radius, y }, // right
    { position: 2, ownerId, x, y: y + radius }, // bottom
    { position: 3, ownerId, x: x - radius, y }, // left
  ];
}
