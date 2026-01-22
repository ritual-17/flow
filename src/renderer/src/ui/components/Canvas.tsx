import KonvaCanvas from '@renderer/ui/render/KonvaCanvas';
import KonvaRenderer from '@renderer/ui/render/KonvaRenderer';

type CanvasProps = {
  width: number;
  height: number;
};
export function Canvas({ width, height }: CanvasProps) {
  return (
    <KonvaCanvas width={width} height={height}>
      <KonvaRenderer />
    </KonvaCanvas>
  );
}
