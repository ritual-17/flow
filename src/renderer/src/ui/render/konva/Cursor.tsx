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
      cornerRadius={3}
      shadowBlur={style.shadow}
    />
  );
}

function getCursorStyle(mode: string) {
  switch (mode) {
    case 'normal':
      return {
        size: 6,
        fill: '#000000',
        stroke: '#ffffff',
        strokeWidth: 1.5,
        shadow: 0,
      };

    case 'insert':
      return {
        size: 6,
        fill: '#ff4d4d',
        stroke: '#000000',
        strokeWidth: 1,
        shadow: 8,
      };

    case 'visual':
    case 'visual-block':
      return {
        size: 6,
        fill: '#00d4ff',
        stroke: '#00d4ff',
        strokeWidth: 1,
        shadow: 6,
      };

    case 'command':
      return {
        size: 6,
        fill: '#ff9f1a',
        stroke: '#000000',
        strokeWidth: 1,
        shadow: 8,
      };

    case 'line':
    case 'anchor-line':
      return {
        size: 6,
        fill: '#2dd4bf',
        stroke: '#000000',
        strokeWidth: 1,
        shadow: 8,
      };

    case 'text':
      return {
        size: 6,
        fill: '#ffd166',
        stroke: '#000000',
        strokeWidth: 1,
        shadow: 8,
      };

    default:
      return {
        size: 5,
        fill: '#000000',
        stroke: 'none',
        strokeWidth: 0,
        shadow: 0,
      };
  }
}

export default Cursor;
