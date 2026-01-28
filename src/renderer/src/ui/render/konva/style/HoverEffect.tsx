import { Shape as DomainShape } from '@renderer/core/geometry/Shape';
import { getAnchorPoints } from '@renderer/core/geometry/utils/AnchorPoints';
import { useStore } from '@renderer/ui/Store';
import { Circle as KonvaCircle } from 'react-konva';

interface HoverEffectProps {
  shape: DomainShape;
  selectedPoint?: number;
}

const LIGHT_BLUE = '#02fceb';

export const HoverEffect = ({ shape, selectedPoint }: HoverEffectProps) => {
  const mode = useStore((state) => state.editor.mode);

  if (mode !== 'normal') {
    return null;
  }

  const anchorPoints = getAnchorPoints(shape);
  return anchorPoints.map((point, index) => {
    const stroke = index === selectedPoint ? 'blue' : LIGHT_BLUE;

    return (
      <KonvaCircle
        key={`anchor-point-${shape.id}-${index}`}
        x={point.x}
        y={point.y}
        radius={3}
        stroke={stroke}
        fill={LIGHT_BLUE}
      />
    );
  });
};
