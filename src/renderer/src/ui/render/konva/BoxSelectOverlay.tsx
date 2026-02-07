import { useStore } from '@renderer/ui/Store';
import { Rect } from 'react-konva';

function BoxSelectOverlay() {
  const mode = useStore((state) => state.editor.mode);
  const anchor = useStore((state) => state.editor.boxSelectAnchor);
  const cursor = useStore((state) => state.editor.cursorPosition);

  if (mode !== 'visual' || !anchor) return null;

  const x = Math.min(anchor.x, cursor.x);
  const y = Math.min(anchor.y, cursor.y);
  const width = Math.abs(cursor.x - anchor.x);
  const height = Math.abs(cursor.y - anchor.y);

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      stroke='rgba(0, 120, 255, 0.9)'
      strokeWidth={1}
      dash={[4, 4]}
      fill='rgba(0, 120, 255, 0.15)'
      listening={false}
    />
  );
}

export default BoxSelectOverlay;
