import { Shape } from '@renderer/core/geometry/Shape';
import Circle from '@renderer/ui/render/konva/Circle';
import Point from '@renderer/ui/render/konva/Point';
import Text from '@renderer/ui/render/konva/Text';
import { JSX } from 'react';

export interface ShapeComponentProps<T extends Shape = Shape> {
  shape: T;
}

export type ShapeComponent<T extends Shape = Shape> = (
  props: ShapeComponentProps<T>,
) => JSX.Element;

function getComponent<T extends Shape>(shape: T): ShapeComponent<T> {
  const componentMap = {
    circle: Circle,
    point: Point,
    textBox: Text,
  } as const;

  return componentMap[shape.type] as ShapeComponent<T>;
}

export default getComponent;
