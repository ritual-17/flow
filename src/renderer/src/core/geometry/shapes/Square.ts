import { AnchorPoint, buildBaseShape, IShapeBase } from '@renderer/core/geometry/Shape';

export type Square = IShapeBase & {
  type: 'square';
  width: number;
  height: number;
};

export function build(attrs: Partial<Square>): Square {
  const square: Square = {
    type: 'square',
    width: 100,
    height: 100,
    ...buildBaseShape(),
    ...attrs,
  };

  return square;
}

export function generateAnchorPoints(square: Square): AnchorPoint[] {
  const { x, y, width, height } = square;
  const ownerId = square.id;

  return [
    { ownerId, position: 0, x: x + width / 2, y: y }, // top center
    { ownerId, position: 1, x: x + width, y: y + height / 2 }, // middle right
    { ownerId, position: 2, x: x + width / 2, y: y + height }, // bottom center
    { ownerId, position: 3, x: x, y: y + height / 2 }, // middle left
  ];
}
