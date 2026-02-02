import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import * as AnchorPoints from '@renderer/core/geometry/utils/AnchorPoints';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { useStore } from '@renderer/ui/Store';
import { Line as KonvaLine } from 'react-konva';

type DomainLine = MultiLine;

// TODO: support styling
// TODO: support hovered and selected props
const Line: ShapeComponent<DomainLine> = ({ shape }: { shape: MultiLine }) => {
  const points = useResolvedPoints(shape).flatMap((pt) => [pt.x, pt.y]);
  return <KonvaLine points={points} stroke='red' />;
};

const useResolvedPoints = (shape: DomainLine) => {
  const document = useStore((state) => state.document);

  return AnchorPoints.resolveLinePoints(document, shape);
};

export default Line;
