/* eslint-disable react/prop-types */
import { TextBox as DomainText } from '@renderer/core/geometry/shapes/TextBox';
import { Editor } from '@renderer/ui/components/text/Editor';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { useStore } from '@renderer/ui/Store';
import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { Html } from 'react-konva-utils';

const TextBox: ShapeComponent<DomainText> = ({ shape, stroke }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const isCurrentlyEditing = useStore((state) => state.editor.editingTextBoxId) === shape.id;

  // need to load the image from the src url in compiledImageMeta
  useEffect(() => {
    if (!shape.compiledImageMeta) {
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

    img.src = shape.compiledImageMeta.src;

    // Cleanup function
    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [shape.compiledImageMeta]);

  return image ? (
    <>
      <KonvaImage
        image={image}
        x={shape.x}
        y={shape.y}
        width={shape.compiledImageMeta!.width}
        height={shape.compiledImageMeta!.height}
        stroke={stroke}
        fill='white'
      />
      {isCurrentlyEditing && (
        <Html>
          <Editor
            x={shape.x}
            y={shape.y + shape.compiledImageMeta!.height}
            initialDoc={shape.text}
          />
        </Html>
      )}
    </>
  ) : (
    <></>
  );
};

export default TextBox;
