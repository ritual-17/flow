/* eslint-disable react/prop-types */
import { TextBox as DomainText } from '@renderer/core/geometry/shapes/TextBox';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';

// This renders a text box that is not currently being edited
const StaticTextBox: ShapeComponent<DomainText> = ({ shape, stroke }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // need to load the image from the src url in compiledImageMeta
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

  return image ? (
    <>
      <KonvaImage
        image={image}
        x={shape.x}
        y={shape.y}
        width={shape.label.compiledImageMeta?.width ?? image.width}
        height={shape.label.compiledImageMeta?.height ?? image.height}
        stroke={stroke}
        fill='white'
      />
    </>
  ) : (
    <></>
  );
};

export default StaticTextBox;
