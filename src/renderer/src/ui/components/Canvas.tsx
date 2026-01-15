import KonvaCanvas from '@renderer/ui/render/KonvaCanvas';
import KonvaRenderer from '@renderer/ui/render/KonvaRenderer';

export function Canvas() {
  return (
    <KonvaCanvas width={window.innerWidth - 100} height={window.innerHeight - 100}>
      <KonvaRenderer />
    </KonvaCanvas>
  );
}
