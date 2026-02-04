/* eslint-disable react/prop-types */
import { TextBox as DomainText } from '@renderer/core/geometry/shapes/TextBox';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';

const TextBox: ShapeComponent<DomainText> = ({ shape, stroke }) => {
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
    <KonvaImage
      image={image}
      x={shape.x}
      y={shape.y}
      width={dimensionScaler(shape, image) * image.width}
      height={dimensionScaler(shape, image) * image.height}
      stroke={stroke}
    />
  ) : (
    <></>
  );
};

function dimensionScaler(textBox: DomainText, image: HTMLImageElement) {
  const widthScale = textBox.width / image.width;
  const heightScale = textBox.height / image.height;
  return Math.min(widthScale, heightScale);
}

export default TextBox;
