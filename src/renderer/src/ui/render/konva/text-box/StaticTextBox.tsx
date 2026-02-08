/* eslint-disable react/prop-types */
import { Shape } from '@renderer/core/geometry/Shape';
import { ShapeComponentProps } from '@renderer/ui/render/konva/ShapeResolver';
import { JSX, useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';

// optional x and y props for specifying label position
interface StaticTextBoxProps<T extends Shape = Shape> extends ShapeComponentProps<T> {
  x?: number;
  y?: number;
}

type StaticTextBoxComponent<T extends Shape = Shape> = (
  props: StaticTextBoxProps<T>,
) => JSX.Element | null;

// This renders a text box or label that is not currently being edited
const StaticTextBox: StaticTextBoxComponent = ({ shape, stroke, x, y }) => {
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

  if (!shape.label.compiledImageMeta) return null;
  if (isEmptyLabel(shape)) return null;

  return (
    image && (
      <KonvaImage
        image={image}
        x={x ? x : shape.x}
        y={y ? y : shape.y}
        width={shape.label.compiledImageMeta.width}
        height={shape.label.compiledImageMeta.height}
        stroke={stroke}
        fill='white'
      />
    )
  );
};

function isEmptyLabel(shape: Shape) {
  return shape.type !== 'textBox' && !shape.label.text;
}

export default StaticTextBox;
