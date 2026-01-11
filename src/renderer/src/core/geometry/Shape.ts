export interface IShapeBase {
  id: ShapeId;
  x: number;
  y: number;
  zIndex: number;
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

export type Shape = Circle | Point | TextBox;
