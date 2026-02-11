import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import * as AnchorPoints from '@renderer/core/geometry/utils/AnchorPoints';
import { ShapeComponent, ShapeComponentProps } from '@renderer/ui/render/konva/ShapeResolver';
import { useStore } from '@renderer/ui/Store';
import { Line as KonvaLine, Arrow as KonvaArrow } from 'react-konva';

type DomainLine = MultiLine;

// TODO: support styling
// TODO: support hovered and selected props
const ARROW_POINTER_LENGTH = 12;
const ARROW_POINTER_WIDTH = 10;

const Line: ShapeComponent<DomainLine> = ({ shape, stroke }: ShapeComponentProps<DomainLine>) => {
  const resolved = useResolvedPoints(shape);
  const points = resolved.flatMap((pt) => [pt.x, pt.y]);

  // determine arrow segment points (use only first/last segment so arrowheads align with segment direction)
  const startSegment: number[] | null =
    resolved.length >= 2 ? [resolved[1].x, resolved[1].y, resolved[0].x, resolved[0].y] : null;
  const endSegment: number[] | null =
    resolved.length >= 2
      ? [resolved[resolved.length - 2].x, resolved[resolved.length - 2].y, resolved[resolved.length - 1].x, resolved[resolved.length - 1].y]
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
    </>
  );
};

const useResolvedPoints = (shape: DomainLine) => {
  const document = useStore((state) => state.document);

  return AnchorPoints.resolveLinePoints(document, shape);
};

export default Line;
