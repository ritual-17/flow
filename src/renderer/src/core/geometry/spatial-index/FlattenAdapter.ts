import Flatten from '@flatten-js/core';
import { Point, Shape, TextBox } from '@renderer/core/geometry/Shape';
import { Circle } from '@renderer/core/geometry/shapes/Circle';

function toFlatten(shape: Shape): Flatten.AnyShape {
  switch (shape.type) {
    case 'circle':
      return toFlattenCircle(shape);
    case 'point':
      return toFlattenPoint(shape);
    case 'textBox':
      return toFlattenTextBox(shape);
  }
}

function toFlattenCircle(circle: Circle): Flatten.Circle {
  return new Flatten.Circle(new Flatten.Point(circle.x, circle.y), circle.radius);
}

function toFlattenPoint(point: Point): Flatten.Point {
  return new Flatten.Point(point.x, point.y);
}

function toFlattenTextBox(textBox: TextBox): Flatten.Polygon {
  const p1 = new Flatten.Point(textBox.x, textBox.y);
  const p2 = new Flatten.Point(textBox.x + textBox.width, textBox.y);
  const p3 = new Flatten.Point(textBox.x + textBox.width, textBox.y + textBox.height);
  const p4 = new Flatten.Point(textBox.x, textBox.y + textBox.height);

  return new Flatten.Polygon([p1, p2, p3, p4]);
}

function fromFlatten(flat: Flatten.AnyShape, original: Shape): Shape {
  if (flat.constructor === Flatten.Circle && original.type === 'circle') {
    return fromFlattenCircle(flat, original);
  }
  if (flat.constructor === Flatten.Point && original.type === 'point') {
    return fromFlattenPoint(flat, original);
  }
  if (flat.constructor === Flatten.Polygon && original.type === 'textBox') {
    return fromFlattenTextBox(flat, original);
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

function fromFlattenTextBox(flat: Flatten.Polygon, original: TextBox): TextBox {
  const vertices = (flat as Flatten.Polygon).vertices;
  const xMin = Math.min(...vertices.map((v) => v.x));
  const yMin = Math.min(...vertices.map((v) => v.y));
  const xMax = Math.max(...vertices.map((v) => v.x));
  const yMax = Math.max(...vertices.map((v) => v.y));

  return {
    ...original,
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin,
  };
}

export { toFlatten, fromFlatten };
