/* eslint-disable react/prop-types */
import { PdfSlide } from '@renderer/core/geometry/shapes/PdfSlide';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';

const PdfSlideShape: ShapeComponent<PdfSlide> = ({ shape, stroke }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!shape.imageDataUrl) return;

    const img = new window.Image();
    img.src = shape.imageDataUrl;
    img.onload = () => setImage(img);
  }, [shape.imageDataUrl]);

  return (
    <KonvaImage
      x={shape.x - shape.width / 2}
      y={shape.y - shape.height / 2}
      width={shape.width}
      height={shape.height}
      image={image ?? undefined}
      stroke={stroke}
    />
  );
};

export default PdfSlideShape;
