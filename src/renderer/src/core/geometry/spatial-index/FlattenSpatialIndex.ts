import Flatten from '@flatten-js/core';
import {
  AnchorPoint,
  Coordinate,
  isLine,
  isPoint,
  Shape,
  ShapeId,
} from '@renderer/core/geometry/Shape';
import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import { TextBox } from '@renderer/core/geometry/shapes/TextBox';
import { fromFlatten, toFlatten } from '@renderer/core/geometry/spatial-index/FlattenAdapter';
import { Direction, SpatialIndex } from '@renderer/core/geometry/SpatialIndex';
import {
  getAnchorPoints,
  isAnchorRef,
  resolveAnchorPoint,
} from '@renderer/core/geometry/utils/AnchorPoints';
import BTree from 'sorted-btree';

type OrderKey = [number, number, ShapeId];

type OrderedShapesCache = BTree<OrderKey, ShapeId>;

type idToShapeMap = Map<ShapeId, { domainShape: Shape; flatShape: Flatten.AnyShape }>;
type shapeToIdMap = Map<Flatten.AnyShape, ShapeId>;

export class FlattenSpatialIndex implements SpatialIndex {
  private set = new Flatten.PlanarSet();
  private idToShapeMap: idToShapeMap = new Map();
  private shapeToIdMap: shapeToIdMap = new Map();
  private SEARCH_RADIUS = 1000;
  // mapping from a shape id to the multi-line shapes that reference it
  private shapeLineRefs = new Map<ShapeId, Set<ShapeId>>();

  // BTree to maintain shapes in a consistent order for next/previous shape retrieval. Ordered by y, then x, then id.
  private orderedShapesCache: OrderedShapesCache = new BTree(
    undefined,
    (a, b) =>
      a[0] - b[0] || // y
      a[1] - b[1] || // x
      a[2].localeCompare(b[2]), // id
  );

  addShape(shape: Shape): void {
    const resolvedShape = this.resolveShapePoints(shape);
    const flat = toFlatten(resolvedShape);

    this.addShapeToSets(resolvedShape, flat);
  }

  updateShape(shape: Shape): void {
    const oldFlat = this.getFlattenShapeById(shape.id);
    this.removeShapeFromSets(shape, oldFlat);

    this.maybeUpdateLineReferences(shape);
    const resolvedShape = this.resolveShapePoints(shape);
    const newFlat = toFlatten(resolvedShape);
    this.addShapeToSets(resolvedShape, newFlat);
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
    this.orderedShapesCache.clear();
  }

  // get all ids for shapes that reference any of the given shape ids
  getReferencingShapeIds(shapeIds: ShapeId[]): ShapeId[] {
    const referencingShapeIds = new Set<ShapeId>();

    shapeIds.forEach((id) => {
      const refs = this.shapeLineRefs.get(id);
      if (refs) {
        refs.forEach((refId) => referencingShapeIds.add(refId));
      }
    });

    return Array.from(referencingShapeIds);
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

  searchAtPoint(point: Coordinate): Shape[] {
    const hits = this.set.hit(new Flatten.Point(point.x, point.y));
    return hits.map((hit) => this.getDomainShape(hit));
  }

  getNearestShape(point: Coordinate): Shape | null {
    const searchBox = new Flatten.Box(
      point.x - this.SEARCH_RADIUS,
      point.y - this.SEARCH_RADIUS,
      point.x + this.SEARCH_RADIUS,
      point.y + this.SEARCH_RADIUS,
    );
    const candidates = this.set.search(searchBox);
    const domainCandidates = candidates
      .map((candidate) => this.getDomainShape(candidate))
      .filter((shape) => {
        // Exclude lines and points
        return shape.type !== 'multi-line' && shape.type !== 'point';
      });

    let nearest: Shape | null = null;
    let minDistance = Infinity;
    for (const candidate of domainCandidates) {
      const distance = this.distanceBetweenPoints(point, candidate);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = candidate;
      }
    }

    return nearest;
  }

  getNearestAnchorPoint(point: Coordinate): AnchorPoint | null {
    const searchBox = new Flatten.Box(
      point.x - this.SEARCH_RADIUS,
      point.y - this.SEARCH_RADIUS,
      point.x + this.SEARCH_RADIUS,
      point.y + this.SEARCH_RADIUS,
    );
    const candidates = this.set.search(searchBox);
    const domainCandidates = candidates.map((candidate) => this.getDomainShape(candidate));

    let nearestPoint: AnchorPoint | null = null;
    let minDistance = Infinity;
    for (const candidate of domainCandidates) {
      const anchorPoints = getAnchorPoints(candidate);
      for (const anchorPoint of anchorPoints) {
        const distance = this.distanceBetweenPoints(point, anchorPoint);
        if (distance < minDistance) {
          minDistance = distance;
          nearestPoint = anchorPoint;
        }
      }
    }

    return nearestPoint;
  }

  // definitely needs a refactor
  getNearestLineCenter(point: Coordinate): { line: MultiLine; point: Coordinate } | null {
    const searchBox = new Flatten.Box(
      point.x - this.SEARCH_RADIUS,
      point.y - this.SEARCH_RADIUS,
      point.x + this.SEARCH_RADIUS,
      point.y + this.SEARCH_RADIUS,
    );
    const candidates = this.set.search(searchBox);
    const domainCandidates = candidates
      .map((candidate) => this.getDomainShape(candidate))
      .filter((shape): shape is MultiLine => shape.type === 'multi-line');

    let nearestLine: MultiLine | null = null;
    let nearestPoint: Coordinate | null = null;
    let minDistance = Infinity;

    for (const candidate of domainCandidates) {
      // Calculate center point of the line
      const centerIndex = Math.floor(candidate.points.length / 2);
      const centerPointRaw = candidate.points[centerIndex];
      let centerPoint: Coordinate;
      if (candidate.points.length % 2 === 0) {
        // average the two center points for even-length lines
        const pointA = candidate.points[centerIndex - 1];
        const pointB = candidate.points[centerIndex];

        let resolvedA: Coordinate;
        let resolvedB: Coordinate;

        if (isAnchorRef(pointA)) {
          const resolvedPointA = resolveAnchorPoint(candidate, pointA.position);
          resolvedA = { x: resolvedPointA.x, y: resolvedPointA.y };
        } else {
          resolvedA = pointA;
        }

        if (isAnchorRef(pointB)) {
          const resolvedPointB = resolveAnchorPoint(candidate, pointB.position);
          resolvedB = { x: resolvedPointB.x, y: resolvedPointB.y };
        } else {
          resolvedB = pointB;
        }

        centerPoint = {
          x: (resolvedA.x + resolvedB.x) / 2,
          y: (resolvedA.y + resolvedB.y) / 2,
        };
      } else {
        if (isAnchorRef(centerPointRaw)) {
          const resolvedPoint = resolveAnchorPoint(candidate, centerPointRaw.position);
          centerPoint = { x: resolvedPoint.x, y: resolvedPoint.y };
        } else {
          centerPoint = centerPointRaw;
        }
      }

      const distance = this.distanceBetweenPoints(point, centerPoint);
      if (distance < minDistance) {
        minDistance = distance;
        nearestLine = candidate;
        nearestPoint = centerPoint;
      }
    }

    if (nearestLine && nearestPoint) {
      return { line: nearestLine, point: nearestPoint };
    }

    return null;
  }

  getNextAnchorPoint(currentAnchor: AnchorPoint, direction: Direction): AnchorPoint {
    // can optimize by searching only in the direction
    const searchBox = new Flatten.Box(
      currentAnchor.x - this.SEARCH_RADIUS,
      currentAnchor.y - this.SEARCH_RADIUS,
      currentAnchor.x + this.SEARCH_RADIUS,
      currentAnchor.y + this.SEARCH_RADIUS,
    );
    const candidates = this.set.search(searchBox);
    const domainCandidates = candidates.map((candidate) => this.getDomainShape(candidate));

    let nextAnchor: AnchorPoint = currentAnchor;
    let minDistance = Infinity;

    for (const candidate of domainCandidates) {
      const anchorPoints = getAnchorPoints(candidate);
      for (const anchorPoint of anchorPoints) {
        let isInDirection = false;
        switch (direction) {
          case 'up':
            isInDirection = anchorPoint.y < currentAnchor.y;
            break;
          case 'down':
            isInDirection = anchorPoint.y > currentAnchor.y;
            break;
          case 'left':
            isInDirection = anchorPoint.x < currentAnchor.x;
            break;
          case 'right':
            isInDirection = anchorPoint.x > currentAnchor.x;
            break;
        }

        if (isInDirection) {
          const distance = this.distanceBetweenPoints(currentAnchor, anchorPoint);
          if (distance < minDistance) {
            minDistance = distance;
            nextAnchor = {
              x: anchorPoint.x,
              y: anchorPoint.y,
              ownerId: anchorPoint.ownerId,
              position: anchorPoint.position,
              userId: anchorPoint.userId,
            };
          }
        }
      }
    }

    return nextAnchor;
  }

  getNextShape(point: Coordinate, backward = false): Shape | null {
    const nearestShape = this.getNearestShape(point);
    if (!nearestShape) return null;

    if (!this.hasCursorCenteredOnShape(point, nearestShape)) return nearestShape;

    const key = this.getOrderKey(nearestShape);

    const next = backward
      ? this.orderedShapesCache.nextLowerKey(key)
      : this.orderedShapesCache.nextHigherKey(key);

    if (!next) return this.wrapAroundShapeList(key) || nearestShape;

    const [_y, _x, nextId] = next;
    return this.getDomainShapeById(nextId);
  }

  removeShapesByIds(shapeIds: ShapeId[]): void {
    shapeIds.forEach((id) => {
      const shape = this.getDomainShapeById(id);
      this.removeShape(shape);
    });
  }

  // could use a refactor to generalize nearest shape search with filter
  getNearestTextBox(point: Coordinate): TextBox | null {
    const searchBox = new Flatten.Box(
      point.x - this.SEARCH_RADIUS,
      point.y - this.SEARCH_RADIUS,
      point.x + this.SEARCH_RADIUS,
      point.y + this.SEARCH_RADIUS,
    );
    const candidates = this.set.search(searchBox);
    const domainCandidates = candidates.map((candidate) => this.getDomainShape(candidate));

    let nearestTextBox: TextBox | null = null;
    let minDistance = Infinity;
    for (const candidate of domainCandidates) {
      if (candidate.type !== 'textBox') continue;

      const distance = this.distanceBetweenPoints(point, candidate);
      if (distance < minDistance) {
        minDistance = distance;
        nearestTextBox = candidate;
      }
    }

    return nearestTextBox;
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

  private resolveShapePoints(shape: Shape): Shape {
    if (shape.type !== 'multi-line') return shape;

    const resolvedPoints = shape.points.map((pt) => {
      if (!isAnchorRef(pt)) return pt;

      const refShape = this.getDomainShapeById(pt.shapeId);
      const anchorPoint = resolveAnchorPoint(refShape, pt.position);

      // track line references for future updates
      if (!this.shapeLineRefs.has(refShape.id)) {
        this.shapeLineRefs.set(refShape.id, new Set<ShapeId>());
      }
      this.shapeLineRefs.get(refShape.id)!.add(shape.id);

      return { x: anchorPoint.x, y: anchorPoint.y };
    });

    return { ...shape, points: resolvedPoints };
  }

  private addShapeToSets(shape: Shape, flat: Flatten.AnyShape): void {
    this.set.add(flat);
    this.idToShapeMap.set(shape.id, { domainShape: shape, flatShape: flat });
    this.shapeToIdMap.set(flat, shape.id);

    // Lines and points are not included in the ordered cache since they are not selectable by next/previous shape command
    if (isLine(shape) || isPoint(shape)) return;

    this.orderedShapesCache.set(this.getOrderKey(shape), shape.id);
  }

  private maybeUpdateLineReferences(shape: Shape): void {
    const referencingLines = this.shapeLineRefs.get(shape.id);
    if (!referencingLines) return;

    referencingLines.forEach((lineId) => {
      const lineShape = this.getFlattenShapeById(lineId);
    });
  }

  private removeShapeFromSets(shape: Shape, flat: Flatten.AnyShape): void {
    const oldShape = this.getDomainShapeById(shape.id);
    this.orderedShapesCache.delete(this.getOrderKey(oldShape));
    this.set.delete(flat);
    this.idToShapeMap.delete(shape.id);
    this.shapeToIdMap.delete(flat);
    this.shapeLineRefs.delete(shape.id);
  }

  private distanceBetweenPoints(pointA: Coordinate, pointB: Coordinate): number {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private wrapAroundShapeList(key: OrderKey): Shape | null {
    if (this.orderedShapesCache.isEmpty) return null;

    const minKey = this.orderedShapesCache.minKey()!;
    const maxKey = this.orderedShapesCache.maxKey()!;

    if (key[0] === maxKey[0] && key[1] === maxKey[1] && key[2] === maxKey[2]) {
      // If we're at the end, wrap to the beginning
      const nextId = this.orderedShapesCache.get(minKey)!;
      return this.getDomainShapeById(nextId);
    } else if (key[0] === minKey[0] && key[1] === minKey[1] && key[2] === minKey[2]) {
      // If we're at the beginning, wrap to the end
      const nextId = this.orderedShapesCache.get(maxKey)!;
      return this.getDomainShapeById(nextId);
    }

    return null;
  }
  private hasCursorCenteredOnShape(cursor: Coordinate, shape: Shape): boolean {
    return cursor.x === shape.x && cursor.y === shape.y;
  }

  private getOrderKey(shape: Shape): OrderKey {
    // You can customize this per shape type if needed
    const { x, y } = shape;
    return [y, x, shape.id];
  }
}
