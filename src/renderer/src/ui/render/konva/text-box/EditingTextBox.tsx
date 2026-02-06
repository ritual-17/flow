/* eslint-disable react/prop-types */
import { TextBox as DomainText } from '@renderer/core/geometry/shapes/TextBox';
import { compileTextBoxContent } from '@renderer/core/geometry/transform/TextBoxContentCompiler';
import { Editor } from '@renderer/ui/components/text/Editor';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import Warning from '@renderer/ui/render/konva/text-box/Warning';
import { useStore } from '@renderer/ui/Store';
import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { Html } from 'react-konva-utils';

const EditingTextBox: ShapeComponent<DomainText> = ({ shape }) => {
  const [compiledTextImage, setCompiledTextImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const content = useStore((state) => state.editor.currentTextBox?.content) || '';
  const updateEditingTextBoxContent = useStore((state) => state.updateEditingTextBoxContent);

  useEffect(() => {
    compileTextBoxContent(content)
      .then((img) => {
        URL.revokeObjectURL(img.src);
        setCompiledTextImage(img);
        setError(null);
      })
      .catch((error) => {
        setError('Failed to compile text box content');
        console.error('Failed to compile text box content:', error);
      });
    return () => {};
  }, [content]);

  if (!compiledTextImage) return <></>;

  return (
    <>
      <KonvaImage
        image={compiledTextImage}
        x={shape.x}
        y={shape.y}
        width={compiledTextImage.width}
        height={compiledTextImage.height}
        stroke={'white'}
        fill='white'
      />
      {error && (
        <Warning x={shape.x + compiledTextImage.width} y={shape.y + compiledTextImage.height} />
      )}
      <Html>
        <Editor
          setContent={updateEditingTextBoxContent}
          x={shape.x}
          y={shape.y + compiledTextImage.height + 5}
          initialDoc={shape.text}
        />
      </Html>
    </>
  );
};

export default EditingTextBox;
