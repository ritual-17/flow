// disabled prop-type warning because typescript knows shape is a DomainCircle
/* eslint-disable react/prop-types */
import { Rectangle as DomainCircle } from '@renderer/core/geometry/Shape';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { Rectangle as KonvaCircle } from 'react-konva';

const Rectangle: ShapeComponent<DomainCircle> = ({ shape }) => {
  return <KonvaCircle x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill='black' />;
};

export default Rectangle;
