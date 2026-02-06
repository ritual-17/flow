import KonvaCanvas from '@renderer/ui/render/KonvaCanvas';
import KonvaRenderer from '@renderer/ui/render/KonvaRenderer';

type CanvasProps = {
  width: number;
  height: number;
};
// main canvas. We are using Konva for rendering as it has a lot of built in optimizations
export function Canvas({ width, height }: CanvasProps) {
  return (
    <KonvaCanvas width={width} height={height}>
      <KonvaRenderer />
    </KonvaCanvas>
  );
}
