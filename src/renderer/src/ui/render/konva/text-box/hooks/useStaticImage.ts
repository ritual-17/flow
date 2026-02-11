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
      // TODO: commenting this out for now because it revokes the image URL, meaning if the textbox is deleted and then re-added via un
      // do/redo, the image wont load. we can revisit this later to find a better way to manage memory without breaking undo/redo by ei
      // either figuring out a smart way to do revokation, or by recompiling images on undo/redo.
      // URL.revokeObjectURL(img.src);
    };

    img.onerror = (error) => {
      console.error('Failed to load image for TextBox:', error);
      setImage(null);
    };

    img.src = shape.label.compiledImageMeta.src;

    // Cleanup function
    return () => {
      // TODO: see above comment on URL revokation
      // URL.revokeObjectURL(img.src);
    };
  }, [shape.label.compiledImageMeta]);

  return image;
}
