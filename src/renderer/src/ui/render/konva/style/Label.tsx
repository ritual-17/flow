import { Shape } from '@renderer/core/geometry/Shape';
import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';

interface LabelProps {
  shape: Shape;
}

function Label({ shape }: LabelProps) {
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

  if (shape.type === 'textBox') return null;
  if (!shape.label.compiledImageMeta) return null;

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
}

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

export default Label;
