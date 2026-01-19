import Cursor from '@renderer/ui/render/konva/Cursor';
import getComponent from '@renderer/ui/render/konva/ShapeResolver';
import { useStore } from '@renderer/ui/Store';

function KonvaRenderer() {
  const shapes = useStore((state) => state.document.shapes)
    .values()
    .toArray();

  return (
    <>
      {shapes.map((shape) => {
        const Component = getComponent(shape);
        return <Component key={shape.id} shape={shape} />;
      })}
      <Cursor />
    </>
  );
}

export default KonvaRenderer;
