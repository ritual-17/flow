// disabled prop-type warning because typescript knows shape is a DomainCircle
/* eslint-disable react/prop-types */
import { Circle as DomainCircle } from '@renderer/core/geometry/Shape';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { Circle as KonvaCircle } from 'react-konva';

const Circle: ShapeComponent<DomainCircle> = ({ shape }) => {
  return <KonvaCircle x={shape.x} y={shape.y} radius={shape.radius} fill='black' />;
};

export default Circle;
