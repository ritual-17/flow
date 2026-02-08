// disabled prop-type warning because typescript knows shape is a DomainCircle
/* eslint-disable react/prop-types */
import { Circle as DomainCircle } from '@renderer/core/geometry/shapes/Circle';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { useEffect, useState } from 'react';
import { Circle as KonvaCircle, Image as KonvaImage } from 'react-konva';

// TODO: support styling
const Circle: ShapeComponent<DomainCircle> = ({ shape, stroke }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!shape.label.compiledImageMeta) {
      setImage(null);
      return;
    }

    const img = new Image();

    img.onload = () => {
      setImage(img);
      URL.revokeObjectURL(img.src);
    };

    img.onerror = (error) => {
      console.error('Failed to load image for TextBox:', error);
      setImage(null);
    };

    img.src = shape.label.compiledImageMeta.src;

    // Cleanup function
    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [shape.label.compiledImageMeta]);
  return (
    <>
      <KonvaCircle x={shape.x} y={shape.y} radius={shape.radius} fill='black' stroke={stroke} />
      {image && (
        <KonvaImage image={image} x={shape.x} y={shape.y - 20} fontSize={14} fill='white' />
      )}
    </>
  );
};

export default Circle;
