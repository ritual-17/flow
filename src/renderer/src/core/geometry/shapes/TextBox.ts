import { buildBaseShape, Coordinate, IShapeBase } from '@renderer/core/geometry/Shape';

export type TextBox = IShapeBase & {
  type: 'textBox';
  width: number;
  height: number;
};

export function build(attrs: Partial<TextBox>): TextBox {
  const textBox: TextBox = {
    type: 'textBox',
    width: 100,
    height: 50,
    ...buildBaseShape(),
    label: {
      text: 'Enter text here',
      compiledImageMeta: null,
    },
    ...attrs,
  };

  return textBox;
}

export function generateAnchorCoordinates(textBox: TextBox): Coordinate[] {
  const { x, y } = textBox;
  const width = textBox.label.compiledImageMeta
    ? textBox.label.compiledImageMeta.width
    : textBox.width;
  const height = textBox.label.compiledImageMeta
    ? textBox.label.compiledImageMeta.height
    : textBox.height;

  return [
    { x: x + width / 2, y: y }, // top center
    { x: x + width, y: y + height / 2 }, // middle right
    { x: x + width / 2, y: y + height }, // bottom center
    { x: x, y: y + height / 2 }, // middle left
  ];
}

export const TextBox = {
  build,
  generateAnchorCoordinates,
};
