import { AnchorRef, buildBaseShape, IShapeBase, Shape } from '@renderer/core/geometry/Shape';
import { resolveAnchorRefCoordinate } from '@renderer/core/geometry/utils/AnchorPoints';

export type Point = IShapeBase & {
  type: 'point';
  ref: AnchorRef | null;
};

export const Point = {
  build,
  fromAnchorRef,
};

export function build(attrs: Partial<Point>): Point {
  const point: Point = {
    type: 'point',
    ref: null,
    ...buildBaseShape(),
    ...attrs,
  };

  return point;
}

export function fromAnchorRef(shape: Shape, ref: AnchorRef): Point {
  const anchorCoordinate = resolveAnchorRefCoordinate(shape, ref.position);

  return Point.build({
    x: anchorCoordinate.x,
    y: anchorCoordinate.y,
    ref: ref,
  });
}
