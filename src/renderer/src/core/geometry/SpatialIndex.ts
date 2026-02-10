import { AnchorPoint, Shape, ShapeId } from '@renderer/core/geometry/Shape';
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
  getNearestShape(point: { x: number; y: number }): Shape | null;
  getNearestAnchorPoint(point: { x: number; y: number }): AnchorPoint | null;
  getNextAnchorPoint(currentAnchor: AnchorPoint, direction: Direction): AnchorPoint;
  removeShapesByIds(shapeIds: ShapeId[]): void;
  getNearestTextBox(point: { x: number; y: number }): TextBox | null;
}

export type Direction = 'up' | 'down' | 'left' | 'right';
