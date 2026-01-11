export interface IShapeBase {
  id: string;
  x: number;
  y: number;
  zIndex: number;
}

export type Circle = IShapeBase & {
  type: 'circle';
  radius: number;
};

export type Point = IShapeBase & {
  type: 'point';
};

export type Shape = Circle | Point;
