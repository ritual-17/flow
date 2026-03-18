import { Document, DocumentModel } from '@renderer/core/document/Document';
import { AnchorRef, Coordinate, Shape } from '@renderer/core/geometry/Shape';
import * as Circle from '@renderer/core/geometry/shapes/Circle';
import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import * as PdfSlide from '@renderer/core/geometry/shapes/PdfSlide';
import { Point } from '@renderer/core/geometry/shapes/Point';
import * as Rectangle from '@renderer/core/geometry/shapes/Rectangle';
import * as Square from '@renderer/core/geometry/shapes/Square';
import { TextBox } from '@renderer/core/geometry/shapes/TextBox';

export function isAnchorRef(point: Coordinate | AnchorRef): point is AnchorRef {
  return 'shapeId' in point;
}

// export function resolveAnchorPoint(shape: Shape, position: number): Coordinate {
/** * Resolves the anchor point for a given shape and position.
 * @param shape The shape for which to resolve the anchor point.
 * @param position The position index of the anchor point to resolve.
 * @returns The coordinate of the resolved anchor point.
 * @throws Will throw an error if the anchor point at the specified position is not found.
 */
export function resolveAnchorRefCoordinate(shape: Shape, position: number): Coordinate {
  const anchorPoints = getAllAnchorCoordinates(shape);
  const point = anchorPoints.find((_ap, index) => index === position);

  if (!point) {
    throw new Error(`Anchor at position ${position} not found for shape ${shape.id}`);
  }

  return point;
}

/** * Resolves a point coordinate, which can be either a direct coordinate or an anchor reference.
 * @param document The document containing the shapes and anchors.
 * @param point The point to resolve, which can be a Coordinate or an AnchorRef.
 * @returns The resolved coordinate of the point.
 * @throws Will throw an error if the anchor reference cannot be resolved.
 */
export function resolvePointCoordinate(
  document: DocumentModel,
  point: Coordinate | AnchorRef,
): Coordinate {
  if (isAnchorRef(point)) {
    const anchorCoordinate = getAnchorCoordinate(document, point);
    if (!anchorCoordinate) {
      throw new Error(`Unable to resolve anchor reference for shape ID ${point.shapeId}`);
    }
    return anchorCoordinate;
  } else {
    return point;
  }
}

// export function getAnchorPoints(shape: Shape): AnchorPoint[] {
export function getAllAnchorCoordinates(shape: Shape): Coordinate[] {
  switch (shape.type) {
    case 'circle':
      return Circle.generateAnchorCoordinates(shape);
    // Add cases for other shape types as needed
    case 'textBox':
      return TextBox.generateAnchorCoordinates(shape);
    case 'pdf':
      return PdfSlide.generateAnchorCoordinates(shape);
    case 'rectangle':
      return Rectangle.generateAnchorCoordinates(shape);
    case 'square':
      return Square.generateAnchorCoordinates(shape);
    default:
      return [];
  }
}

function getAnchorCoordinate(document: DocumentModel, ref: AnchorRef): Coordinate | null {
  if (!Document.hasShape(document, ref.shapeId)) {
    return null;
  }
  const shape = Document.getShapeById(document, ref.shapeId);
  const anchorPoint = resolveAnchorCoordinate(shape, ref.position);

  return { x: anchorPoint.x, y: anchorPoint.y };
}

export function resolveLineCoordinates(document: DocumentModel, line: MultiLine): Coordinate[] {
  return line.points
    .map((p) => (isAnchorRef(p) ? getAnchorCoordinate(document, p) : p))
    .filter((pt): pt is Coordinate => pt !== null);
}

export function newPointFromAnchorRef(document: DocumentModel, ref: AnchorRef): Point {
  const shape = Document.getShapeById(document, ref.shapeId);

  return Point.fromAnchorRef(shape, ref);
}
