/* eslint-disable react/prop-types */
import { TextBox as DomainText } from '@renderer/core/geometry/shapes/TextBox';
import { compileTextBoxContent } from '@renderer/core/geometry/transform/TextBoxContentCompiler';
import { Editor } from '@renderer/ui/components/text/Editor';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { useStore } from '@renderer/ui/Store';
import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { Html } from 'react-konva-utils';

const EditingTextBox: ShapeComponent<DomainText> = ({ shape }) => {
  const [compiledTextImage, setCompiledTextImage] = useState<HTMLImageElement | null>(null);

  const content = useStore((state) => state.editor.currentTextBox?.content) || '';
  const updateEditingTextBoxContent = useStore((state) => state.updateEditingTextBoxContent);

  console.log('EditingTextBox render, content:', content);
  useEffect(() => {
    compileTextBoxContent(content)
      .then((img) => {
        URL.revokeObjectURL(img.src);
        setCompiledTextImage(img);
      })
      .catch((error) => {
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

function svgStringToImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export default EditingTextBox;
