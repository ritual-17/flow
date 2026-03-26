import { AnchorRef, Coordinate, Shape } from '@renderer/core/geometry/Shape';
import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import {
  isAnchorRef,
  resolveAnchorRefCoordinate,
} from '@renderer/core/geometry/utils/AnchorPoints';

export class AnchorPointDereferencer {
  lines: MultiLine[];
  refs: Shape[];

  constructor(lines: MultiLine[], refs: Shape[]) {
    this.lines = lines;
    this.refs = refs;
  }

  populateLinePointsFromReferences(): MultiLine[] {
    const updatedLines = this.lines.map((line) => this.updateLinePoints(line));

    return updatedLines;
  }

  private updateLinePoints(line: MultiLine): MultiLine {
    if (line.type !== 'multi-line') return line;

    const updatedPoints: MultiLine['points'] = line.points
      .map((point) => {
        return isAnchorRef(point) ? this.dereferenceAnchor(point) : point;
      })
      .filter((pt): pt is Coordinate => pt !== null);

    return { ...line, points: updatedPoints };
  }

  private dereferenceAnchor(ref: AnchorRef) {
    const referenceShape = this.refs.find((r) => r.id === ref.shapeId);

    // If we don't find a reference shape,
    // the anchor ref is referencing some other shape and we shouldn't dereference it
    if (!referenceShape) {
      return ref;
    }

    const coordinate: Coordinate = resolveAnchorRefCoordinate(referenceShape, ref.position);

    return coordinate;
  }
}
