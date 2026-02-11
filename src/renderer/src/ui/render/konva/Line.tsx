import { Coordinate } from '@renderer/core/geometry/Shape';
import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import { useResolvedPoints } from '@renderer/ui/hooks/useResolvedPoints';
import { ShapeComponent, ShapeComponentProps } from '@renderer/ui/render/konva/ShapeResolver';
import Label from '@renderer/ui/render/konva/style/Label';
import { Line as KonvaLine } from 'react-konva';

type DomainLine = MultiLine;

// TODO: support styling
// TODO: support hovered and selected props
const Line: ShapeComponent<DomainLine> = ({ shape, stroke }: ShapeComponentProps<DomainLine>) => {
  const points = useResolvedPoints(shape);

  const flatArrayPoints = points.flatMap((pt) => [pt.x, pt.y]);

  const centerIndex = Math.floor(points.length / 2);

  let center: Coordinate;
  if (points.length % 2 === 0) {
    // if even number of points, take the average of the two middle points
    const centerX = (points[centerIndex - 1].x + points[centerIndex].x) / 2;
    const centerY = (points[centerIndex - 1].y + points[centerIndex].y) / 2;
    center = { x: centerX, y: centerY };
  } else {
    center = { x: points[centerIndex].x, y: points[centerIndex].y };
  }

  return (
    <>
      <KonvaLine points={flatArrayPoints} stroke={stroke} />
      <Label shape={shape} center={center} />
    </>
  );
};

export default Line;
