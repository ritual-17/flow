import { useStore } from '@renderer/ui/Store';
import { Stage } from 'react-konva';

type CanvasProps = {
  width: number;
  height: number;
  children?: React.ReactNode;
};

const KonvaCanvas = ({ height, width, children }: CanvasProps) => {
  const viewport = useStore((state) => state.viewport);
  const pan = useStore((state) => state.pan);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    pan(e.evt.deltaX, e.evt.deltaY);
  };
  return (
    <Stage
      width={width}
      height={height}
      x={viewport.x}
      y={viewport.y}
      scaleX={viewport.zoom}
      scaleY={viewport.zoom}
      onWheel={handleWheel}
    >
      {children}
    </Stage>
  );
};

export default KonvaCanvas;
