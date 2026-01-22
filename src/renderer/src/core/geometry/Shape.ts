export interface IShapeBase {
  id: ShapeId;
  x: number;
  y: number;
  zIndex: number;
  stroke: number;
  fill: number;
  strokeColor: string;
  fillColor: string;
}

export type ShapeId = string;

export type Circle = IShapeBase & {
  type: 'circle';
  radius: number;
};

export type Point = IShapeBase & {
  type: 'point';
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
