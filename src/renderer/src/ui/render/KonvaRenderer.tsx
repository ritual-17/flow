import Cursor from '@renderer/ui/render/konva/Cursor';
import getComponent from '@renderer/ui/render/konva/ShapeResolver';
import { useStore } from '@renderer/ui/Store';
import { Group, Layer } from 'react-konva';

function KonvaRenderer() {
  const shapes = useStore((state) => state.document.shapes)
    .values()
    .toArray();

  // const selectedShapeIds = new Set(useStore((state) => state.editor.selectedShapeIds));

  return (
    <Layer>
      {shapes.map((shape) => {
        const Component = getComponent(shape);
        return (
          <Group key={`group-${shape.id}`}>
            <Component key={shape.id} shape={shape} />
          </Group>
        );
      })}
      <Cursor />
    </Layer>
  );
}

export default KonvaRenderer;
