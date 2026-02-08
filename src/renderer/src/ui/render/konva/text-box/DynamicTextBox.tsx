/* eslint-disable react/prop-types */
import { TextBox as DomainText } from '@renderer/core/geometry/shapes/TextBox';
import {
  compileTextBoxContent,
  dimensionScaler,
} from '@renderer/core/geometry/transform/TextBoxContentCompiler';
import { Editor } from '@renderer/ui/components/text/Editor';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import Warning from '@renderer/ui/render/konva/text-box/Warning';
import { useStore } from '@renderer/ui/Store';
import { useEffect, useRef, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { Html } from 'react-konva-utils';

// This renders a text box that is currently being edited and has changing content
const DynamicTextBox: ShapeComponent<DomainText> = ({ shape }) => {
  const [compiledTextImage, setCompiledTextImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // track the latest request to prevent race conditions
  const requestIdRef = useRef(0);
  const lastImageUrlRef = useRef<string | null>(null);

  const content = useStore((state) => state.editor.currentTextBox?.content) || '';
  const updateEditingTextBoxContent = useStore((state) => state.updateEditingTextBoxContent);

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;

    compileTextBoxContent(content)
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
        setCompiledTextImage(img);
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

  if (!compiledTextImage) return <></>;

  const { width: scaledWidth, height: scaledHeight } = dimensionScaler(shape, compiledTextImage);
  return (
    <>
      <KonvaImage
        image={compiledTextImage}
        x={shape.x}
        y={shape.y}
        width={scaledWidth}
        height={scaledHeight}
        stroke={'white'}
        fill='white'
      />
      {error && <Warning x={shape.x + scaledWidth} y={shape.y + scaledHeight} />}
      <Html>
        <Editor
          setContent={updateEditingTextBoxContent}
          x={shape.x}
          y={shape.y + scaledHeight + 5}
          initialDoc={shape.label.text}
        />
      </Html>
    </>
  );
};

export default DynamicTextBox;
