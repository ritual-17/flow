import { Circle, Rect } from 'react-konva';

// Exclamation mark icon to indicate a warning

interface WarningProps {
  x: number;
  y: number;
}
const HEIGHT = 10;
const WIDTH = 2;
const RADIUS = WIDTH / 2;
const STROKE = 'black';
const STROKE_WIDTH = 1;
const FILL = 'red';
function Warning({ x, y }: WarningProps) {
  const [rectX, rectY] = [x - 5, y - 13];
  const [circleX, circleY] = [x + RADIUS - 5, y];
  return (
    <>
      <Rect
        x={rectX}
        y={rectY}
        width={WIDTH}
        height={HEIGHT}
        // stroke={STROKE}
        fill={FILL}
        cornerRadius={10}
        // strokeWidth={STROKE_WIDTH}
      />

      <Circle
        x={circleX}
        y={circleY}
        radius={RADIUS}
        // stroke={STROKE}
        // strokeWidth={STROKE_WIDTH}
        fill={FILL}
      />
    </>
  );
}

export default Warning;
