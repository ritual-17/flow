import { useNearestShape } from '@renderer/ui/hooks/NearestShape';
import BoxSelectOverlay from '@renderer/ui/render/konva/BoxSelectOverlay';
import Cursor from '@renderer/ui/render/konva/Cursor';
import getComponent from '@renderer/ui/render/konva/ShapeResolver';
import { useStore } from '@renderer/ui/Store';
import { Group, Layer } from 'react-konva';

function KonvaRenderer() {
  const mode = useStore((state) => state.editor.mode);
  const shapes = useStore((state) => state.document.shapes)
    .values()
    .toArray();
  const selectedShapeIds = new Set(useStore((state) => state.editor.selectedShapeIds));

  const nearestShapeId = useNearestShape();

  return (
    <Layer>
      {shapes.map((shape) => {
        const Component = getComponent(shape);
        const hovered = shape.id === nearestShapeId || mode === 'anchor-line';

        return (
          <Group key={`group-${shape.id}`}>
            <Component
              key={shape.id}
              shape={shape}
              hovered={hovered}
              selected={selectedShapeIds.has(shape.id)}
            />
          </Group>
        );
      })}
      <Cursor />
      <BoxSelectOverlay />
    </Layer>
  );
}

export default KonvaRenderer;
