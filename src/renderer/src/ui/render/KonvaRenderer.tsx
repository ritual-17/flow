import { isLine } from '@renderer/core/geometry/Shape';
import { useNearestShape } from '@renderer/ui/hooks/NearestShape';
import Cursor from '@renderer/ui/render/konva/Cursor';
import getComponent from '@renderer/ui/render/konva/ShapeResolver';
import { HoverEffect } from '@renderer/ui/render/konva/style/HoverEffect';
import { useStore } from '@renderer/ui/Store';
import { Group, Layer } from 'react-konva';

function KonvaRenderer() {
  const mode = useStore((state) => state.editor.mode);
  const allShapes = useStore((state) => state.document.shapes)
    .values()
    .toArray();

  // could optimize this to do one pass instead of two
  const shapes = allShapes.filter((shape) => !isLine(shape));
  const lines = allShapes.filter((shape) => isLine(shape));

  const selectedShapeIds = new Set(useStore((state) => state.editor.selectedShapeIds));

  const nearestShapeId = useNearestShape();

  return (
    <Layer>
      {shapes.map((shape) => {
        const Component = getComponent(shape);
        const hovered = shape.id === nearestShapeId || mode === 'anchor-line';

        const selected = selectedShapeIds.has(shape.id);
        const stroke = selected ? 'blue' : 'white';

        return (
          <Group key={`group-${shape.id}`}>
            <Component key={shape.id} shape={shape} stroke={stroke} />
            {hovered && <HoverEffect shape={shape} />}
          </Group>
        );
      })}
      {lines.map((shape) => {
        const Component = getComponent(shape);
        const hovered = shape.id === nearestShapeId || mode === 'anchor-line';

        const selected = selectedShapeIds.has(shape.id);
        const stroke = selected ? 'blue' : 'black';
        return (
          <Group key={`group-${shape.id}`}>
            <Component key={shape.id} shape={shape} stroke={stroke} />
            {hovered && <HoverEffect shape={shape} />}
          </Group>
        );
      })}
      <Cursor />
    </Layer>
  );
}

export default KonvaRenderer;
