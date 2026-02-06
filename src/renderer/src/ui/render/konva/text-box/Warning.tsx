import { Circle } from 'react-konva';

// Exclamation mark icon to indicate a warning

interface WarningProps {
  x: number;
  y: number;
}
const RADIUS = 5;
const FILL = 'red';
function Warning({ x, y }: WarningProps) {
  const [circleX, circleY] = [x - RADIUS, y - RADIUS];
  return (
    <>
      <Circle x={circleX} y={circleY} radius={RADIUS} fill={FILL} />
    </>
  );
}

export default Warning;
