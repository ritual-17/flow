// disabled prop-type warning because typescript knows shape is a DomainCircle
/* eslint-disable react/prop-types */
import { Circle as DomainCircle } from '@renderer/core/geometry/shapes/Circle';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { memo } from 'react';
import { Circle as KonvaCircle } from 'react-konva';

// TODO: support styling
const Circle: ShapeComponent<DomainCircle> = ({ shape, stroke }) => {
  return (
    <KonvaCircle
      x={shape.x}
      y={shape.y}
      radius={shape.radius}
      fill={shape.fillColor}
      stroke={stroke}
      strokeWidth={shape.strokeWidth}
    />
  );
};

// disable re-rendering unless the shape's properties or stroke color change for performance optimization
export default memo(Circle);
