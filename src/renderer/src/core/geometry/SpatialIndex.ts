import { Shape, ShapeId } from '@renderer/core/geometry/Shape';

export interface SpatialIndex {
  addShape(shape: Shape): void;
  updateShape(shape: Shape): void;
  removeShape(shape: Shape): void;
  getShapes(): Shape[];
  clearShapes(): void;
  distanceBetweenShapes(shapeA: Shape, shapeB: Shape): number;
  searchInArea(area: { xMin: number; xMax: number; yMin: number; yMax: number }): Shape[];
  getNearestShapeId(point: { x: number; y: number }): ShapeId | null;
}
