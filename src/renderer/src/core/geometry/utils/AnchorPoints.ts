import { DocumentModel, getShapeById } from '@renderer/core/document/Document';
import { AnchorPoint, AnchorRef, Coordinate, Shape } from '@renderer/core/geometry/Shape';
import * as Circle from '@renderer/core/geometry/shapes/Circle';
import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import * as Point from '@renderer/core/geometry/shapes/Point';
import * as Rectangle from '@renderer/core/geometry/shapes/Rectangle';
import { TextBox } from '@renderer/core/geometry/shapes/TextBox';

export function isAnchorRef(point: Coordinate | AnchorRef): point is AnchorRef {
  return 'shapeId' in point;
}

export function getAnchorPoints(shape: Shape): AnchorPoint[] {
  switch (shape.type) {
    case 'circle':
      return Circle.generateAnchorPoints(shape);
    // Add cases for other shape types as needed
    case 'textBox':
      return TextBox.generateAnchorPoints(shape);
    case 'rectangle':
      return Rectangle.generateAnchorPoints(shape);
    default:
      return [];
  }
}

export function getAnchorPoint(document: DocumentModel, ref: AnchorRef): Point.Point {
  const shape = getShapeById(document, ref.shapeId);
  const anchorPoint = resolveAnchorPoint(shape, ref.position);

  return Point.build({
    x: anchorPoint.x,
    y: anchorPoint.y,
    ref: ref,
  });
}

export function resolveLinePoints(document: DocumentModel, line: MultiLine): Coordinate[] {
  return line.points.map((p) => (isAnchorRef(p) ? getAnchorCoordinate(document, p) : p));
}

function getAnchorCoordinate(document: DocumentModel, ref: AnchorRef): Coordinate {
  const shape = getShapeById(document, ref.shapeId);
  const anchorPoint = resolveAnchorPoint(shape, ref.position);

  return { x: anchorPoint.x, y: anchorPoint.y };
}

export function resolveAnchorPoint(shape: Shape, position: number): AnchorPoint {
  const anchorPoints = getAnchorPoints(shape);
  const point = anchorPoints.find((ap) => ap.position === position);

  if (!point) {
    throw new Error(`Anchor point at position ${position} not found for shape ${shape.id}`);
  }

  return point;
}
