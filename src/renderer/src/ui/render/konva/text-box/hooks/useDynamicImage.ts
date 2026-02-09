import { ImageCompiler } from '@renderer/core/geometry/text/ImageCompiler';
import { useStore } from '@renderer/ui/Store';
import { useEffect, useRef, useState } from 'react';

export function useDynamicImage() {
  const [compiledImage, setCompiledImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // track the latest request to prevent race conditions
  const requestIdRef = useRef(0);
  const lastImageUrlRef = useRef<string | null>(null);

  const content = useStore((state) => state.editor.currentTextBox?.content) || '';
  const updateCurrentTextBoxContent = useStore((state) => state.updateCurrentTextBoxContent);

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;

    ImageCompiler.compileFromText(content)
      .then((img) => {
        // check if this response is still relevant (i.e. the content hasn't changed since this request was made)
        if (currentRequestId !== requestIdRef.current) {
          if (img && img.src) {
            URL.revokeObjectURL(img.src);
          }
          return;
        }

        // revoke the previous image URL if it exists to prevent memory leaks
        if (lastImageUrlRef.current && lastImageUrlRef.current !== img.src) {
          URL.revokeObjectURL(lastImageUrlRef.current);
        }

        lastImageUrlRef.current = img.src;
        setCompiledImage(img);
        setError(null);
      })
      .catch((error) => {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setError('Failed to compile text box content');
        console.error('Failed to compile text box content:', error);
      });

    return () => {
      if (lastImageUrlRef.current) {
        URL.revokeObjectURL(lastImageUrlRef.current);
        lastImageUrlRef.current = null;
      }
    };
  }, [content]);

  return { compiledImage, error, updateCurrentTextBoxContent };
}
