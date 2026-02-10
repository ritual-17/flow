// disabled prop-type warning because typescript knows shape is a DomainSquare
/* eslint-disable react/prop-types */
import { Square as DomainSquare } from '@renderer/core/geometry/shapes/Square';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { Rect as KonvaSquare } from 'react-konva';

// TODO: support styling
const Square: ShapeComponent<DomainSquare> = ({ shape }) => {
  return (
    <KonvaSquare
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

export default Square;
