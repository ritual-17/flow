import Flatten from '@flatten-js/core';
import { Circle, Point, Shape } from '@renderer/core/geometry/Shape';

function toFlatten(shape: Shape): Flatten.AnyShape {
  switch (shape.type) {
    case 'circle':
      return toFlattenCircle(shape);
    case 'point':
      return toFlattenPoint(shape);
  }
}

function toFlattenCircle(circle: Circle): Flatten.Circle {
  return new Flatten.Circle(new Flatten.Point(circle.x, circle.y), circle.radius);
}

function toFlattenPoint(point: Point): Flatten.Point {
  return new Flatten.Point(point.x, point.y);
}

function fromFlatten(flat: Flatten.AnyShape, original: Shape): Shape {
  if (flat.constructor === Flatten.Circle && original.type === 'circle') {
    return fromFlattenCircle(flat, original);
  }
  if (flat.constructor === Flatten.Point && original.type === 'point') {
    return fromFlattenPoint(flat, original);
  }
  throw new Error('Shape type mismatch');
}

function fromFlattenCircle(flat: Flatten.Circle, original: Circle): Circle {
  return {
    ...original,
    x: flat.center.x,
    y: flat.center.y,
    radius: flat.r,
  };
}

function fromFlattenPoint(flat: Flatten.Point, original: Point): Point {
  return {
    ...original,
    x: flat.x,
    y: flat.y,
  };
}

export { toFlatten, fromFlatten };
