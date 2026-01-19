import { useStore } from '@renderer/ui/Store';
import { Rect } from 'react-konva';

function Cursor() {
  const cursorPosition = useStore((state) => state.editor.cursorPosition);

  return (
    <Rect
      x={cursorPosition.x}
      y={cursorPosition.y}
      width={5}
      height={5}
      fill='red'
      shadowBlur={10}
    />
  );
}

export default Cursor;
