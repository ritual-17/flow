import { useStore } from '@renderer/ui/Store';
import { Rect } from 'react-konva';

function Cursor() {
  const cursorPosition = useStore((state) => state.editor.cursorPosition);
  const mode = useStore((state) => state.editor.mode);
  const style = getCursorStyle(mode);

  return (
    <Rect
      x={cursorPosition.x}
      y={cursorPosition.y}
      width={style.size}
      height={style.size}
      fill={style.fill}
      stroke={style.stroke}
      strokeWidth={style.strokeWidth}
      cornerRadius={2}
      shadowBlur={style.shadow}
    />
  );
}

function getCursorStyle(mode: string) {
  switch (mode) {
    case 'normal':
      return {
        size: 6,
        fill: 'transparent',
        stroke: '#ffffff',
        strokeWidth: 1.5,
        shadow: 0,
      };

    case 'insert':
      return {
        size: 4,
        fill: '#ff4d4d',
        stroke: 'none',
        strokeWidth: 0,
        shadow: 8,
      };

    case 'visual':
      return {
        size: 6,
        fill: '#00d4ff',
        stroke: '#00d4ff',
        strokeWidth: 1,
        shadow: 6,
      };

    default:
      return {
        size: 5,
        fill: '#ffffff',
        stroke: 'none',
        strokeWidth: 0,
        shadow: 0,
      };
  }
}

export default Cursor;
