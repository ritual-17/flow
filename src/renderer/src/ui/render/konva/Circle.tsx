// disabled prop-type warning because typescript knows shape is a DomainCircle
/* eslint-disable react/prop-types */
import { Circle as DomainCircle } from '@renderer/core/geometry/shapes/Circle';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { HoverEffect } from '@renderer/ui/render/konva/style/HoverEffect';
import { Circle as KonvaCircle } from 'react-konva';

const Circle: ShapeComponent<DomainCircle> = ({ shape }) => {
  return (
    <>
      <KonvaCircle x={shape.x} y={shape.y} radius={shape.radius} fill='black' />
      <HoverEffect shape={shape} />
    </>
  );
};

export default Circle;
