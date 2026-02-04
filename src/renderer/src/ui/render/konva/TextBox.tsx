/* eslint-disable react/prop-types */
import { TextBox as DomainText } from '@renderer/core/geometry/shapes/TextBox';
import { ShapeComponent } from '@renderer/ui/render/konva/ShapeResolver';
import { Image as KonvaImage } from 'react-konva';

const TextBox: ShapeComponent<DomainText> = ({ shape, stroke }) => {
  return shape.compiledImage ? (
    <KonvaImage
      image={shape.compiledImage}
      x={shape.x}
      y={shape.y}
      width={shape.compiledImage.width}
      height={shape.compiledImage.height}
      stroke={stroke}
    />
  ) : (
    <></>
  );
};

export default TextBox;
