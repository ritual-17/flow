import Flatten from '@flatten-js/core';
import { Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { fromFlatten, toFlatten } from '@renderer/core/geometry/shape/FlattenAdapter';
import { ShapeCollection } from '@renderer/core/geometry/ShapeCollection';

type idToShapeMap = Map<ShapeId, { domainShape: Shape; flatShape: Flatten.AnyShape }>;
type shapeToIdMap = Map<Flatten.AnyShape, ShapeId>;

export class FlattenShapeCollection implements ShapeCollection<Shape> {
  private set = new Flatten.PlanarSet();
  private idToShapeMap: idToShapeMap = new Map();
  private shapeToIdMap: shapeToIdMap = new Map();

  addShape(shape: Shape): void {
    const flat = toFlatten(shape);

    this.addShapeToSets(shape, flat);
  }

  updateShape(shape: Shape): void {
    const shapesFromId = this.idToShapeMap.get(shape.id);
    if (!shapesFromId)
      throw new Error('Tried to update a shape that does not exist in the collection');

    const oldFlat = shapesFromId.flatShape;
    this.removeShapeFromSets(shape, oldFlat);

    const newFlat = toFlatten(shape);
    this.addShapeToSets(shape, newFlat);
  }

  removeShape(shape: Shape): void {
    const shapesFromId = this.idToShapeMap.get(shape.id);
    if (!shapesFromId)
      throw new Error('Tried to remove a shape that does not exist in the collection');

    this.removeShapeFromSets(shape, shapesFromId.flatShape);
  }

  getShapeIds(): ShapeId[] {
    return Array.from(this.idToShapeMap.keys());
  }

  getShapes(): Shape[] {
    const shapes = Array.from(this.idToShapeMap.values());

    return shapes.map(({ domainShape, flatShape }) => fromFlatten(flatShape, domainShape));
  }

  clearShapes(): void {
    this.set.clear();
    this.idToShapeMap.clear();
    this.shapeToIdMap.clear();
  }

  searchInArea(area: { xMin: number; xMax: number; yMin: number; yMax: number }): Shape[] {
    const box = new Flatten.Box(area.xMin, area.yMin, area.xMax, area.yMax);

    const hits = this.set.search(box);
    return hits.map((hit) => this.findDomainShape(hit));
  }

  private findDomainShape(flat: Flatten.AnyShape): Shape {
    const shapeId = this.shapeToIdMap.get(flat);
    if (!shapeId) throw new Error('Shape not found');

    const shapesFromId = this.idToShapeMap.get(shapeId);
    if (!shapesFromId) throw new Error('Shape not found');

    return shapesFromId.domainShape;
  }

  private addShapeToSets(shape: Shape, flat: Flatten.AnyShape): void {
    this.set.add(flat);
    this.idToShapeMap.set(shape.id, { domainShape: shape, flatShape: flat });
    this.shapeToIdMap.set(flat, shape.id);
  }

  private removeShapeFromSets(shape: Shape, flat: Flatten.AnyShape): void {
    this.set.delete(flat);
    this.idToShapeMap.delete(shape.id);
    this.shapeToIdMap.delete(flat);
  }
}
