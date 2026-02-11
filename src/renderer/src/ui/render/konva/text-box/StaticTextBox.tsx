/* eslint-disable react/prop-types */
import { Shape } from '@renderer/core/geometry/Shape';
import { ShapeComponentProps } from '@renderer/ui/render/konva/ShapeResolver';
import { useStaticImage } from '@renderer/ui/render/konva/text-box/hooks/useStaticImage';
import { JSX } from 'react';
import { Image as KonvaImage } from 'react-konva';

// optional x and y props for specifying label position
interface StaticTextBoxProps<T extends Shape = Shape> extends ShapeComponentProps<T> {
  x?: number;
  y?: number;
}

type StaticTextBoxComponent<T extends Shape = Shape> = (
  props: StaticTextBoxProps<T>,
) => JSX.Element | null;

// This renders a text box or label that is not currently being edited
const StaticTextBox: StaticTextBoxComponent = ({ shape, stroke, x, y }) => {
  const image = useStaticImage(shape);

  if (!shape.label.compiledImageMeta) return null;
  if (isEmptyLabel(shape)) return null;

  return (
    image && (
      <KonvaImage
        image={image}
        x={x ?? shape.x}
        y={y ?? shape.y}
        width={shape.label.compiledImageMeta.width}
        height={shape.label.compiledImageMeta.height}
        stroke={stroke}
        fill='white'
        cornerRadius={10}
      />
    )
  );
};

function isEmptyLabel(shape: Shape) {
  return shape.type !== 'textBox' && !shape.label.text;
}

export default StaticTextBox;
