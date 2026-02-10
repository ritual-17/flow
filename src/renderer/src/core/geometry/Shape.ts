import { Circle } from '@renderer/core/geometry/shapes/Circle';
import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import { Point } from '@renderer/core/geometry/shapes/Point';
import { Rectangle } from '@renderer/core/geometry/shapes/Rectangle';
import { TextBox } from '@renderer/core/geometry/shapes/TextBox';
import { generateId } from '@renderer/core/utils/id';

export function buildBaseShape(): IShapeBase {
  return {
    id: generateId(),
    x: 0,
    y: 0,
    anchorPoints: [],
    zIndex: 1,
    stroke: 1,
    fill: 1,
    strokeColor: 'black',
    fillColor: 'white',
    label: {
      text: '',
      compiledImageMeta: null,
    },
  };
}

export interface IShapeBase {
  id: ShapeId;
  x: number;
  y: number;
  anchorPoints: AnchorPoint[];
  zIndex: number;
  stroke: number;
  fill: number;
  strokeColor: string;
  fillColor: string;
  label: Label;
}

export type Label = {
  text: string;
  compiledImageMeta: ImageMeta | null;
};

export type ImageMeta = {
  src: string;
  width: number;
  height: number;
};

export type ShapeId = string;
export type Coordinate = { x: number; y: number };

export type AnchorRef = { shapeId: ShapeId; position: number };
export type LinePoint = Coordinate | AnchorRef;

// TODO: remove AnchorPoint and references to it. Use AnchorRef instead.
export type AnchorPoint = {
  ownerId: ShapeId; // the shape this anchor point belongs to
  userId?: ShapeId; // the shape that is using this anchor point
  position: number; // where along the shape's perimeter the anchor point is located
  x: number;
  y: number;
};
// maybe to be added, or we could possibly stick to multiline only
// export type Line = IShapeBase & {
//   type: 'line';
//   x2: number;
//   y2: number;
//   startAnchor?: AnchorPoint;
//   endAnchor?: AnchorPoint;
// };

// possible future shape for grouping multiple shapes
// export type Cell = IShapeBase & {
//   type: 'cell';
//   shapes: Shape[];
// };

export function isLine(shape: Shape): shape is MultiLine {
  return shape.type === 'multi-line';
}

export function assertIsTextBox(shape: Shape): asserts shape is TextBox {
  if (shape.type !== 'textBox') {
    throw new Error(`Shape with id ${shape.id} is not a TextBox`);
  }
}

export type Shape = Circle | Point | TextBox | MultiLine | Rectangle;
