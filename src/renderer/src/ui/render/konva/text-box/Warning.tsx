import { Circle } from 'react-konva';

// A small red circle that appears next to a text box when there is an error compiling the text box content
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
