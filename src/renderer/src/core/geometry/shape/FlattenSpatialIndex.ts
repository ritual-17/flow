import Flatten from '@flatten-js/core';
import { Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { fromFlatten, toFlatten } from '@renderer/core/geometry/shape/FlattenAdapter';
import { SpatialIndex } from '@renderer/core/geometry/SpatialIndex';

type idToShapeMap = Map<ShapeId, { domainShape: Shape; flatShape: Flatten.AnyShape }>;
type shapeToIdMap = Map<Flatten.AnyShape, ShapeId>;

export class FlattenSpatialIndex implements SpatialIndex {
  private set = new Flatten.PlanarSet();
  private idToShapeMap: idToShapeMap = new Map();
  private shapeToIdMap: shapeToIdMap = new Map();

  addShape(shape: Shape): void {
    const flat = toFlatten(shape);

    this.addShapeToSets(shape, flat);
  }

  updateShape(shape: Shape): void {
    const oldFlat = this.getFlattenShapeById(shape.id);
    this.removeShapeFromSets(shape, oldFlat);

    const newFlat = toFlatten(shape);
    this.addShapeToSets(shape, newFlat);
  }

  removeShape(shape: Shape): void {
    const flat = this.getFlattenShapeById(shape.id);

    this.removeShapeFromSets(shape, flat);
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

  distanceBetweenShapes(shapeA: Shape, shapeB: Shape): number {
    const flatA = this.getFlattenShapeById(shapeA.id);
    const flatB = this.getFlattenShapeById(shapeB.id);

    if (
      flatA instanceof Flatten.Vector ||
      flatB instanceof Flatten.Vector ||
      flatA instanceof Flatten.Ray ||
      flatB instanceof Flatten.Ray
    ) {
      throw new Error('Distance calculation not supported for Vector or Ray shapes');
    }

    const [distance, _shortestSegment] = flatA.distanceTo(flatB);

    return distance;
  }

  searchInArea(area: { xMin: number; xMax: number; yMin: number; yMax: number }): Shape[] {
    const box = new Flatten.Box(area.xMin, area.yMin, area.xMax, area.yMax);

    const hits = this.set.search(box);
    return hits.map((hit) => this.getDomainShape(hit));
  }

  private getDomainShape(flat: Flatten.AnyShape): Shape {
    const id = this.shapeToIdMap.get(flat);
    if (!id) throw new Error('Shape not found');

    return this.getDomainShapeById(id);
  }

  private getFlattenShapeById(id: ShapeId): Flatten.AnyShape {
    const shape = this.idToShapeMap.get(id);
    if (!shape) throw new Error('Shape not found');
    return shape.flatShape;
  }

  private getDomainShapeById(id: ShapeId): Shape {
    const shape = this.idToShapeMap.get(id);
    if (!shape) throw new Error('Shape not found');

    return shape.domainShape;
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
