import { Shape } from '@renderer/core/geometry/Shape';

export interface SpatialIndex {
  addShape(shape: Shape): void;
  updateShape(shape: Shape): void;
  removeShape(shape: Shape): void;
  getShapes(): Shape[];
  clearShapes(): void;
  distanceBetweenShapes(shapeA: Shape, shapeB: Shape): number;
  searchInArea(area: { xMin: number; xMax: number; yMin: number; yMax: number }): Shape[];
}
