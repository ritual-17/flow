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
    if (!shape.compiledImageMeta) {
      setImage(null);
      return;
    }

    const img = new Image();

    img.onload = () => {
      setImage(img);
      // TODO: commenting this out for now because it revokes the image URL, meaning if the textbox is deleted and then re-added via un
      // do/redo, the image wont load. we can revisit this later to find a better way to manage memory without breaking undo/redo by ei
      // either figuring out a smart way to do revokation, or by recompiling images on undo/redo.
      // URL.revokeObjectURL(img.src);
    };

    img.onerror = (error) => {
      console.error('Failed to load image for TextBox:', error);
      setImage(null);
    };

    img.src = shape.compiledImageMeta.src;

    // Cleanup function
    return () => {
      // TODO: see above comment on URL revokation
      // URL.revokeObjectURL(img.src);
    };
  }, [shape.compiledImageMeta]);

  return image ? (
    <>
      <KonvaImage
        image={image}
        x={shape.x}
        y={shape.y}
        width={shape.compiledImageMeta?.width ?? image.width}
        height={shape.compiledImageMeta?.height ?? image.height}
        stroke={stroke}
        fill='white'
      />
    </>
  ) : (
    <></>
  );
};

export default StaticTextBox;
