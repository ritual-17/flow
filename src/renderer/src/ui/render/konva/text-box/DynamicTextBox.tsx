/* eslint-disable react/prop-types */
import { Coordinate, Shape } from '@renderer/core/geometry/Shape';
import { ImageCompiler } from '@renderer/core/geometry/text/ImageCompiler';
import { Editor } from '@renderer/ui/components/text/Editor';
import { ShapeComponentProps } from '@renderer/ui/render/konva/ShapeResolver';
import { useDynamicImage } from '@renderer/ui/render/konva/text-box/hooks/useDynamicImage';
import { LocationResolver } from '@renderer/ui/render/konva/text-box/LocationResolver';
import Warning from '@renderer/ui/render/konva/text-box/Warning';
import { JSX } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { Html } from 'react-konva-utils';

// optional x and y props for specifying label position
interface DynamicTextBoxProps<T extends Shape = Shape> extends ShapeComponentProps<T> {
  center?: Coordinate;
}

type DynamicTextBoxComponent<T extends Shape = Shape> = (
  props: DynamicTextBoxProps<T>,
) => JSX.Element | null;

// This renders a text box or label that is currently being edited and has changing content
const DynamicTextBox: DynamicTextBoxComponent = ({ shape, center }) => {
  const { compiledImage, error, updateCurrentTextBoxContent } = useDynamicImage();

  if (!compiledImage) return <></>;

  const { width: scaledWidth, height: scaledHeight } = ImageCompiler.getScaledDimensions(
    shape,
    compiledImage,
  );

  const { x, y } =
    center ||
    LocationResolver.resolveImagePosition(shape, {
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
      {error && <Warning x={x + scaledWidth} y={y + scaledHeight} />}
      <Html>
        <Editor
          setContent={updateCurrentTextBoxContent}
          x={center?.x || shape.x}
          y={(center?.y || shape.y) + scaledHeight + 5}
          initialDoc={shape.label.text}
        />
      </Html>
    </>
  );
};

export default DynamicTextBox;
