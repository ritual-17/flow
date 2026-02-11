import { Coordinate } from '@renderer/core/geometry/Shape';
import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import { useResolvedPoints } from '@renderer/ui/hooks/useResolvedPoints';
import { ShapeComponent, ShapeComponentProps } from '@renderer/ui/render/konva/ShapeResolver';
import Label from '@renderer/ui/render/konva/style/Label';
import { Arrow as KonvaArrow, Line as KonvaLine } from 'react-konva';

type DomainLine = MultiLine;

// TODO: support styling
// TODO: support hovered and selected props
const ARROW_POINTER_LENGTH = 12;
const ARROW_POINTER_WIDTH = 10;

const Line: ShapeComponent<DomainLine> = ({ shape, stroke }: ShapeComponentProps<DomainLine>) => {
  const resolved = useResolvedPoints(shape);
  const points = resolved.flatMap((pt) => [pt.x, pt.y]);

  const centerIndex = Math.floor(resolved.length / 2);

  let center: Coordinate;
  if (resolved.length % 2 === 0) {
    // if even number of points, take the average of the two middle points
    const centerX = (resolved[centerIndex - 1].x + resolved[centerIndex].x) / 2;
    const centerY = (resolved[centerIndex - 1].y + resolved[centerIndex].y) / 2;
    center = { x: centerX, y: centerY };
  } else {
    center = { x: resolved[centerIndex].x, y: resolved[centerIndex].y };
  }

  // determine arrow segment points (use only first/last segment so arrowheads align with segment direction)
  const startSegment: number[] | null =
    resolved.length >= 2 ? [resolved[1].x, resolved[1].y, resolved[0].x, resolved[0].y] : null;
  const endSegment: number[] | null =
    resolved.length >= 2
      ? [
          resolved[resolved.length - 2].x,
          resolved[resolved.length - 2].y,
          resolved[resolved.length - 1].x,
          resolved[resolved.length - 1].y,
        ]
      : null;

  return (
    <>
      <KonvaLine points={points} stroke={stroke} />
      {shape.arrowEnd && endSegment && (
        <KonvaArrow
          points={endSegment}
          fill={stroke}
          stroke={stroke}
          pointerLength={ARROW_POINTER_LENGTH}
          pointerWidth={ARROW_POINTER_WIDTH}
        />
      )}
      {shape.arrowStart && startSegment && (
        <KonvaArrow
          points={startSegment}
          fill={stroke}
          stroke={stroke}
          pointerLength={ARROW_POINTER_LENGTH}
          pointerWidth={ARROW_POINTER_WIDTH}
        />
      )}
      <Label shape={shape} center={center} />
    </>
  );
};

export default Line;
