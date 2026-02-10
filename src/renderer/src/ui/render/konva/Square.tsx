import { Square as DomainSquare } from '@renderer/core/geometry/shapes/Square';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { Rect as KonvaSquare } from 'react-konva';

// TODO: support styling
const Square: ShapeComponent<DomainSquare> = ({ shape, stroke }) => {
  return (
    <KonvaSquare
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      fill='black'
      stroke={stroke}
    />
  );
};

export default Square;
