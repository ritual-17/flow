// disabled prop-type warning because typescript knows shape is a DomainCircle
/* eslint-disable react/prop-types */
import { Point as DomainPoint } from '@renderer/core/geometry/Shape';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { Circle as KonvaPoint } from 'react-konva';

const Point: ShapeComponent<DomainPoint> = ({ shape }) => {
  return <KonvaPoint x={shape.x} y={shape.y} radius={5} fill='black' />;
};

export default Point;
