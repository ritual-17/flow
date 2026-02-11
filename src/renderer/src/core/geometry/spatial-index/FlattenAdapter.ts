import Flatten from '@flatten-js/core';
import { AnchorRef, Coordinate, Shape } from '@renderer/core/geometry/Shape';
import { Circle } from '@renderer/core/geometry/shapes/Circle';
import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import { Point } from '@renderer/core/geometry/shapes/Point';
import { Rectangle } from '@renderer/core/geometry/shapes/Rectangle';
import { Square } from '@renderer/core/geometry/shapes/Square';
import { TextBox } from '@renderer/core/geometry/shapes/TextBox';
import { isAnchorRef } from '@renderer/core/geometry/utils/AnchorPoints';

function toFlatten(shape: Shape): Flatten.AnyShape {
  switch (shape.type) {
    case 'circle':
      return toFlattenCircle(shape);
    case 'rectangle':
      return toFlattenRectangle(shape);
    case 'square':
      return toFlattenSquare(shape); // Square can be treated as a special case of Rectangle
    case 'point':
      return toFlattenPoint(shape);
    case 'textBox':
      return toFlattenTextBox(shape);
    case 'multi-line':
      return toFlattenMultiLine(shape);
  }
}

function toFlattenCircle(circle: Circle): Flatten.Circle {
  return new Flatten.Circle(new Flatten.Point(circle.x, circle.y), circle.radius);
}

function toFlattenRectangle(rectangle: Rectangle): Flatten.Polygon {
  const p1 = new Flatten.Point(rectangle.x, rectangle.y);
  const p2 = new Flatten.Point(rectangle.x + rectangle.width, rectangle.y);
  const p3 = new Flatten.Point(rectangle.x + rectangle.width, rectangle.y + rectangle.height);
  const p4 = new Flatten.Point(rectangle.x, rectangle.y + rectangle.height);

  return new Flatten.Polygon([p1, p2, p3, p4]);
}

function toFlattenSquare(square: Square): Flatten.Polygon {
  const p1 = new Flatten.Point(square.x, square.y);
  const p2 = new Flatten.Point(square.x + square.width, square.y);
  const p3 = new Flatten.Point(square.x + square.width, square.y + square.height);
  const p4 = new Flatten.Point(square.x, square.y + square.height);

  return new Flatten.Polygon([p1, p2, p3, p4]);
}

function toFlattenPoint(point: Point): Flatten.Point {
  return new Flatten.Point(point.x, point.y);
}

function toFlattenTextBox(textBox: TextBox): Flatten.Polygon {
  const width = textBox.label.compiledImageMeta
    ? textBox.label.compiledImageMeta.width
    : textBox.width;
  const height = textBox.label.compiledImageMeta
    ? textBox.label.compiledImageMeta.height
    : textBox.height;

  const p1 = new Flatten.Point(textBox.x, textBox.y);
  const p2 = new Flatten.Point(textBox.x + width, textBox.y);
  const p3 = new Flatten.Point(textBox.x + width, textBox.y + height);
  const p4 = new Flatten.Point(textBox.x, textBox.y + height);

  return new Flatten.Polygon([p1, p2, p3, p4]);
}

function toFlattenMultiLine(multiLine: MultiLine): Flatten.Multiline {
  if (multiLine.points.length < 2) {
    throw new Error('MultiLine must have at least 2 points to convert to Flatten.Multiline');
  }
  const lines = multiLine.points.reduce<Flatten.Segment[]>((acc, pt, index) => {
    if (index === 0) return acc;
    const prevPt = multiLine.points[index - 1];

    assertLinePointisCoordinate(pt);
    assertLinePointisCoordinate(prevPt);

    const line = new Flatten.Segment(
      new Flatten.Point(prevPt.x, prevPt.y),
      new Flatten.Point(pt.x, pt.y),
    );
    acc.push(line);
    return acc;
  }, []);
  return new Flatten.Multiline(lines);
}

function assertLinePointisCoordinate(point: Coordinate | AnchorRef): asserts point is Coordinate {
  if (isAnchorRef(point)) {
    throw new Error('AnchorRef found where Coordinate expected');
  }
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
