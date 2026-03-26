import { buildBaseShape, Coordinate, IShapeBase } from '@renderer/core/geometry/Shape';

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

export function generateAnchorCoordinates(circle: Circle): Coordinate[] {
  const { x, y, radius } = circle;

  return [
    { x, y: y - radius }, // top
    { x: x + radius, y }, // right
    { x, y: y + radius }, // bottom
    { x: x - radius, y }, // left
  ];
}

export const Circle = {
  build,
  generateAnchorCoordinates,
};
