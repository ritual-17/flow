import { buildBaseShape, Coordinate, IShapeBase } from '@renderer/core/geometry/Shape';

export type Square = IShapeBase & {
  type: 'square';
  width: number;
  height: number;
};

export const Square = {
  build,
  generateAnchorPoints: generateAnchorCoordinates,
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

export function generateAnchorCoordinates(square: Square): Coordinate[] {
  const { x, y, width, height } = square;

  return [
    { x: x, y: y - height / 2 }, // top center
    { x: x + width / 2, y: y }, // middle right
    { x: x, y: y + height / 2 }, // bottom center
    { x: x - width / 2, y: y }, // middle left
  ];
}
