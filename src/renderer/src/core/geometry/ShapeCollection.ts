import { ShapeId } from '@renderer/core/geometry/Shape';

export interface ShapeCollection<T> {
  addShape(shape: T): void;
  removeShape(shape: T): void;
  getShapeIds(): ShapeId[];
  getShapes(): T[];
  clearShapes(): void;
  searchInArea(area: { xMin: number; xMax: number; yMin: number; yMax: number }): T[];
}
