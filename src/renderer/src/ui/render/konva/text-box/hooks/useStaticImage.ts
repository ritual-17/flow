import { Shape } from '@renderer/core/geometry/Shape';
import { useEffect, useState } from 'react';

export function useStaticImage(shape: Shape) {
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

  return image;
}
