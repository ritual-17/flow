import { AnchorRef, Coordinate, Shape } from '@renderer/core/geometry/Shape';
import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import { isAnchorRef, resolveAnchorPoint } from '@renderer/core/geometry/utils/AnchorPoints';

export class AnchorPointDereferencer {
  lines: Shape[];
  refs: Shape[];

  constructor(lines: Shape[], refs: Shape[]) {
    this.lines = lines;
    this.refs = refs;
  }

  populateLinePointsFromReferences(): Shape[] {
    const updatedLines = this.lines.map((line) => this.updateLinePoints(line));

    return updatedLines;
  }

  private updateLinePoints(line: Shape): Shape {
    if (line.type !== 'multi-line') return line;

    const updatedPoints: MultiLine['points'] = line.points
      .map((point) => {
        return isAnchorRef(point) ? this.dereferenceAnchorPoint(point) : point;
      })
      .filter((pt): pt is Coordinate => pt !== null);

    return { ...line, points: updatedPoints };
  }

  private dereferenceAnchorPoint(point: AnchorRef) {
    const reference = this.refs.find((r) => r.id === point.shapeId);
    if (reference) {
      const resolvedPoint = resolveAnchorPoint(reference, point.position);
      const coordinate: Coordinate = { x: resolvedPoint.x, y: resolvedPoint.y };

      return coordinate;
    } else {
      // If the reference shape is not found, remove this point
      console.warn(`Line is referencing a shape that does not exist: ${point.shapeId}`);
      return null;
    }
  }
}
