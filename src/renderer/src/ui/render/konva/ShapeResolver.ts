import { Shape } from '@renderer/core/geometry/Shape';
import Circle from '@renderer/ui/render/konva/Circle';
import Line from '@renderer/ui/render/konva/Line';
import Point from '@renderer/ui/render/konva/Point';
import Rectangle from '@renderer/ui/render/konva/Rectangle';
import TextBox from '@renderer/ui/render/konva/TextBox';
import { JSX } from 'react';

export interface ShapeComponentProps<T extends Shape = Shape> {
  shape: T;
  stroke?: string;
}

export type ShapeComponent<T extends Shape = Shape> = (
  props: ShapeComponentProps<T>,
) => JSX.Element;

function getComponent<T extends Shape>(shape: T): ShapeComponent<T> {
  const componentMap = {
    circle: Circle,
    point: Point,
    textBox: TextBox,
    'multi-line': Line,
    rectangle: Rectangle,
  } as const;

  return componentMap[shape.type] as ShapeComponent<T>;
}

export default getComponent;
