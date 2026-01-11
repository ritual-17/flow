import Flatten from '@flatten-js/core';
import { Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { fromFlatten, toFlatten } from '@renderer/core/geometry/shape/FlattenAdapter';
import { ShapeCollection } from '@renderer/core/geometry/ShapeCollection';

type toFlattenShapeMap = Map<ShapeId, { domainShape: Shape; flatShape: Flatten.AnyShape }>;
type toShapeIdMap = Map<Flatten.AnyShape, ShapeId>;

export class FlattenShapeCollection implements ShapeCollection<Shape> {
  private set = new Flatten.PlanarSet();
  private toFlattenShapeMap: toFlattenShapeMap = new Map();
  private toShapeIdMap: toShapeIdMap = new Map();

  addShape(shape: Shape): void {
    const flat = toFlatten(shape);
    this.set.add(flat);
    this.toFlattenShapeMap.set(shape.id, { flatShape: flat, domainShape: shape });
    this.toShapeIdMap.set(flat, shape.id);
  }

  removeShape(shape: Shape): void {
    const shapesFromId = this.toFlattenShapeMap.get(shape.id);
    if (!shapesFromId) return;

    this.set.delete(shapesFromId.flatShape);
    this.toFlattenShapeMap.delete(shape.id);
    this.toShapeIdMap.delete(shapesFromId.flatShape);
  }

  getShapeIds(): ShapeId[] {
    return Array.from(this.toFlattenShapeMap.keys());
  }

  getShapes(): Shape[] {
    const shapes = Array.from(this.toFlattenShapeMap.values());

    return shapes.map(({ domainShape, flatShape }) => fromFlatten(flatShape, domainShape));
  }

  clearShapes(): void {
    this.set.clear();
    this.toFlattenShapeMap.clear();
    this.toShapeIdMap.clear();
  }

  searchInArea(area: { xMin: number; xMax: number; yMin: number; yMax: number }): Shape[] {
    const box = new Flatten.Box(area.xMin, area.yMin, area.xMax, area.yMax);

    const hits = this.set.search(box);
    return hits.map((hit) => this.findDomainShape(hit));
  }

  private findDomainShape(flat: Flatten.AnyShape): Shape {
    const shapeId = this.toShapeIdMap.get(flat);
    if (!shapeId) throw new Error('Shape not found');

    const shapesFromId = this.toFlattenShapeMap.get(shapeId);
    if (!shapesFromId) throw new Error('Shape not found');

    return shapesFromId.domainShape;
  }
}
