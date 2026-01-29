import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { Line as KonvaLine } from 'react-konva';

type DomainLine = MultiLine;

const Line: ShapeComponent<DomainLine> = ({ shape }: { shape: MultiLine }) => {
  const points = shape.points.flatMap((point) => [point.x, point.y]);
  return <KonvaLine points={points} stroke='red' />;
};

export default Line;
