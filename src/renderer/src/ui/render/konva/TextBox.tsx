/* eslint-disable react/prop-types */
import { TextBox as DomainText } from '@renderer/core/geometry/shapes/TextBox';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';

const TextBox: ShapeComponent<DomainText> = ({ shape }) => {
  const [compiledTextImage, setCompiledTextImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const compile = async () => {
      try {
        const svg = await window.api.compileTypst(shape.text);
        if (cancelled) return;

        const img = await svgStringToImage(svg);
        if (!cancelled) {
          setCompiledTextImage(img);
        }
      } catch (err) {
        console.error('Typst compile failed:', err);
      }
    };

    compile();

    return () => {
      cancelled = true;
    };
  }, [shape.text]);

  if (!compiledTextImage) return <></>;

  return (
    <KonvaImage
      image={compiledTextImage}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      stroke={'white'}
    />
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

export default TextBox;
