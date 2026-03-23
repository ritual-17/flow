import { AnchorRef, Coordinate, Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import { TextBox } from '@renderer/core/geometry/shapes/TextBox';

export interface SpatialIndex {
  addShape(shape: Shape): void;
  updateShape(shape: Shape): void;
  removeShape(shape: Shape): void;
  getShapes(): Shape[];
  clearShapes(): void;
  getReferencingShapeIds(shapeIds: ShapeId[]): ShapeId[];
  distanceBetweenShapes(shapeA: Shape, shapeB: Shape): number;
  searchInArea(area: { xMin: number; xMax: number; yMin: number; yMax: number }): Shape[];
  searchAtPoint(point: Coordinate): Shape[];
  getNearestShape(point: Coordinate): Shape | null;
  getNearestAnchorRef(point: Coordinate, anchorPointOwner?: ShapeId): AnchorRef | null;
  getNearestLineCenter(point: Coordinate): { line: MultiLine; point: Coordinate } | null;
  getNextAnchorRef(currentAnchor: AnchorRef, direction: Direction): AnchorRef;
  getNextShape(point: Coordinate, backward?: boolean): Shape | null;
  removeShapesByIds(shapeIds: ShapeId[]): void;
  getNearestTextBox(point: Coordinate): TextBox | null;
}

export type Direction = 'up' | 'down' | 'left' | 'right';
