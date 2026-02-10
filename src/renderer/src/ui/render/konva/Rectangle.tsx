// disabled prop-type warning because typescript knows shape is a DomainCircle
/* eslint-disable react/prop-types */
import { Rectangle as DomainRectangle } from '@renderer/core/geometry/shapes/Rectangle';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { Rect as KonvaRectangle } from 'react-konva';

// TODO: support styling
const Rectangle: ShapeComponent<DomainRectangle> = ({ shape }) => {
  return (
    <KonvaRectangle
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      fill={shape.fillColor}
      stroke={shape.strokeColor}
      strokeWidth={shape.strokeWidth}
    />
  );
};

export default Rectangle;
