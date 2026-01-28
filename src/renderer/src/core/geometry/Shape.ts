import { Circle } from '@renderer/core/geometry/shapes/Circle';
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
}

export type ShapeId = string;

export type AnchorPoint = {
  ownerId: ShapeId; // the shape this anchor point belongs to
  userId?: ShapeId; // the shape that is using this anchor point
  position: number; // where along the shape's perimeter the anchor point is located
  x: number;
  y: number;
};

export type Point = IShapeBase & {
  type: 'point';
};

export type Line = IShapeBase & {
  type: 'line';
  x2: number;
  y2: number;
  startAnchor?: AnchorPoint;
  endAnchor?: AnchorPoint;
};

export type TextBox = IShapeBase & {
  type: 'textBox';
  width: number;
  height: number;
  text: string;
};

// possible future shape for grouping multiple shapes
// export type Cell = IShapeBase & {
//   type: 'cell';
//   shapes: Shape[];
// };

export type Shape = Circle | Point | TextBox;
