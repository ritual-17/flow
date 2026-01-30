import { AnchorPoint, AnchorRef, buildBaseShape, IShapeBase } from '@renderer/core/geometry/Shape';

export type Point = IShapeBase & {
  type: 'point';
  anchor: AnchorPoint | null;
  ref: AnchorRef | null;
};

export function build(attrs: Partial<Point>): Point {
  const point: Point = {
    type: 'point',
    anchor: null,
    ref: null,
    ...buildBaseShape(),
    ...attrs,
  };

  return point;
}
