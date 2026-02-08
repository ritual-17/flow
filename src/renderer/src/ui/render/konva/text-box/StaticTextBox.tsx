/* eslint-disable react/prop-types */
import { Shape } from '@renderer/core/geometry/Shape';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';

// This renders a text box that is not currently being edited
const StaticTextBox: ShapeComponent<Shape> = ({ shape, stroke }) => {
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
  if (shape.type === 'textBox') {
    return (
      image && (
        <KonvaImage
          image={image}
          x={shape.x}
          y={shape.y}
          width={shape.label.compiledImageMeta?.width ?? image.width}
          height={shape.label.compiledImageMeta?.height ?? image.height}
          stroke={stroke}
          fill='white'
        />
      )
    );
  }
  if (!shape.label.text) return null;

  const { width, height } = resolveLabelDimensions(shape);
  const { x, y } = resolveLabelPosition(shape, { width, height });

  return (
    image && (
      <KonvaImage
        image={image}
        width={width}
        height={height}
        x={x}
        y={y}
        fontSize={14}
        fill='white'
      />
    )
  );
};

function resolveLabelDimensions(shape: Shape) {
  const { width: labelWidth, height: labelHeight } = shape.label.compiledImageMeta!;
  const { width: shapeWidth, height: shapeHeight } = getShapeDimensions(shape);

  // if the label is larger than the shape, we need to scale it down to fit within the shape
  const widthScale = shapeWidth > 0 ? Math.min(1, shapeWidth / labelWidth) : 1;
  const heightScale = shapeHeight > 0 ? Math.min(1, shapeHeight / labelHeight) : 1;
  const scale = Math.min(widthScale, heightScale);

  return {
    width: labelWidth * scale,
    height: labelHeight * scale,
  };
}

function resolveLabelPosition(shape: Shape, labelDimensions?: { width: number; height: number }) {
  const { width: labelWidth, height: labelHeight } =
    labelDimensions || shape.label.compiledImageMeta!;
  const shapeCenter = getCenterCoordinate(shape);
  return {
    x: shapeCenter.x - labelWidth / 2,
    y: shapeCenter.y - labelHeight / 2,
  };
}

// gets the center of the shape.
// for something like a rectangle, it would be x + width/2, y + height/2
function getCenterCoordinate(shape: Shape) {
  switch (shape.type) {
    case 'circle':
      return { x: shape.x, y: shape.y };
    default:
      return { x: shape.x, y: shape.y };
  }
}

function getShapeDimensions(shape: Shape) {
  switch (shape.type) {
    case 'circle':
      return { width: shape.radius * 2, height: shape.radius * 2 };
    default:
      return { width: 0, height: 0 };
  }
}

export default StaticTextBox;
