import { isLine } from '@renderer/core/geometry/Shape';
import { PdfSlide } from '@renderer/core/geometry/shapes/PdfSlide';
import { useNearestShape } from '@renderer/ui/hooks/NearestShape';
import BoxSelectOverlay from '@renderer/ui/render/konva/BoxSelectOverlay';
import Cursor from '@renderer/ui/render/konva/Cursor';
import getComponent from '@renderer/ui/render/konva/ShapeResolver';
import { HoverEffect } from '@renderer/ui/render/konva/style/HoverEffect';
import { useStore } from '@renderer/ui/Store';
import React from 'react';
import { Group, Image as KonvaImage, Layer } from 'react-konva';

// where shapes are rendered using Konva
const DEFAULT_STROKE_COLOUR = 'white';

function PdfSlideNode({ slide }: { slide: PdfSlide }) {
  const [img, setImg] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    const image = new window.Image();
    image.src = slide.imageDataUrl;
    image.onload = () => setImg(image);
  }, [slide.imageDataUrl]);

  if (!img) return null;

  return (
    <KonvaImage image={img} x={slide.x} y={slide.y} width={slide.width} height={slide.height} />
  );
}

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
        const stroke = selected ? 'blue' : DEFAULT_STROKE_COLOUR;

        return (
          <Group key={`group-${shape.id}`}>
            <Component key={shape.id} shape={shape} stroke={stroke} />
            {hovered && <HoverEffect shape={shape} />}
          </Group>
        );
      })}
      {/* rendering lines after so they are rendered on top of shapes  */}
      {lines.map((shape) => {
        const Component = getComponent(shape);
        const hovered = shape.id === nearestShapeId || mode === 'anchor-line';

        const selected = selectedShapeIds.has(shape.id);
        const stroke = selected ? 'blue' : DEFAULT_STROKE_COLOUR;
        return (
          <Group key={`group-${shape.id}`}>
            <Component key={shape.id} shape={shape} stroke={stroke} />
            {hovered && <HoverEffect shape={shape} />}
          </Group>
        );
      })}

      <Cursor />
      <BoxSelectOverlay />
    </Layer>
  );
}

export default KonvaRenderer;
