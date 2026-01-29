import { AnchorPoint, buildBaseShape, IShapeBase } from '@renderer/core/geometry/Shape';

export type Point = IShapeBase & {
  type: 'point';
  anchor: AnchorPoint | null;
};

export function build(attrs: Partial<Point>): Point {
  const point: Point = {
    type: 'point',
    anchor: null,
    ...buildBaseShape(),
    ...attrs,
  };

  return point;
}
