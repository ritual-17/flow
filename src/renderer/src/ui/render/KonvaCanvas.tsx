import { Layer, Stage } from 'react-konva';

type CanvasProps = {
  width: number;
  height: number;
  children?: React.ReactNode;
};

const KonvaCanvas = ({ height, width, children }: CanvasProps) => {
  return (
    <Stage width={width} height={height}>
      <Layer>{children}</Layer>
    </Stage>
  );
};

export default KonvaCanvas;
