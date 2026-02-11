import { AnchorRef, buildBaseShape, Coordinate, IShapeBase } from '@renderer/core/geometry/Shape';
import { Point } from '@renderer/core/geometry/shapes/Point';

export type MultiLine = IShapeBase & {
  type: 'multi-line';
  points: (Coordinate | AnchorRef)[];
  // arrow flags control whether an arrowhead is drawn at the start/end of the line
  arrowStart?: boolean;
  arrowEnd?: boolean;
};

type LinePoint = Coordinate | AnchorRef;

export function build(attrs: Partial<MultiLine>): MultiLine {
  const multiLine: MultiLine = {
    type: 'multi-line',
    points: [],
    arrowStart: false,
    arrowEnd: false,
    ...buildBaseShape(),
    ...attrs,
  };

  return multiLine;
}

export function fromStartingPoint(start: Point, attrs: Partial<MultiLine> = {}): MultiLine {
  const lineStart: LinePoint = resolveRefOrCoord(start);
  const points = [lineStart];

  return build({
    points: points,
    ...attrs,
  });
}

function resolveRefOrCoord(point: Point): LinePoint {
  return point.ref ? point.ref : { x: point.x, y: point.y };
}

export function addPoint(line: MultiLine, point: LinePoint): MultiLine {
  return {
    ...line,
    points: [...line.points, point],
  };
}
