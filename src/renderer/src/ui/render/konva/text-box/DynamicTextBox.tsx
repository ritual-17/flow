/* eslint-disable react/prop-types */
import { Shape } from '@renderer/core/geometry/Shape';
import { ImageCompiler } from '@renderer/core/geometry/text/ImageCompiler';
import { Editor } from '@renderer/ui/components/text/Editor';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { useDynamicImage } from '@renderer/ui/render/konva/text-box/hooks/useDynamicImage';
import { LocationResolver } from '@renderer/ui/render/konva/text-box/LocationResolver';
import Warning from '@renderer/ui/render/konva/text-box/Warning';
import { Image as KonvaImage } from 'react-konva';
import { Html } from 'react-konva-utils';

// This renders a text box or label that is currently being edited and has changing content
const DynamicTextBox: ShapeComponent<Shape> = ({ shape }) => {
  const { compiledImage, error, updateCurrentTextBoxContent } = useDynamicImage();

  if (!compiledImage) return <></>;

  const { width: scaledWidth, height: scaledHeight } = ImageCompiler.getScaledDimensions(
    shape,
    compiledImage,
  );

  const { x, y } = LocationResolver.resolveImagePosition(shape, {
    width: scaledWidth,
    height: scaledHeight,
  });

  return (
    <>
      <KonvaImage
        image={compiledImage}
        x={x}
        y={y}
        width={scaledWidth}
        height={scaledHeight}
        stroke={'white'}
        fill='white'
      />
      {error && <Warning x={shape.x + scaledWidth} y={shape.y + scaledHeight} />}
      <Html>
        <Editor
          setContent={updateCurrentTextBoxContent}
          x={shape.x}
          y={shape.y + scaledHeight + 5}
          initialDoc={shape.label.text}
        />
      </Html>
    </>
  );
};

export default DynamicTextBox;
