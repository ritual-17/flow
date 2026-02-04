import { AnchorPoint, buildBaseShape, IShapeBase } from '@renderer/core/geometry/Shape';

export type TextBox = IShapeBase & {
  type: 'textBox';
  width: number;
  height: number;
  text: string;
  compiledImage: HTMLImageElement | null;
};

export function build(attrs: Partial<TextBox>): TextBox {
  const textBox: TextBox = {
    type: 'textBox',
    width: 100,
    height: 50,
    text: 'Enter text here',
    compiledImage: null,
    ...buildBaseShape(),
    ...attrs,
  };

  return textBox;
}

export function generateAnchorPoints(textBox: TextBox): AnchorPoint[] {
  const { x, y, id: ownerId } = textBox;
  const width = textBox.compiledImage ? textBox.compiledImage.width : textBox.width;
  const height = textBox.compiledImage ? textBox.compiledImage.height : textBox.height;

  return [
    { ownerId, position: 0, x: x + width / 2, y: y }, // top center
    { ownerId, position: 1, x: x + width, y: y + height / 2 }, // middle right
    { ownerId, position: 2, x: x + width / 2, y: y + height }, // bottom center
    { ownerId, position: 3, x: x, y: y + height / 2 }, // middle left
  ];
}

export const TextBox = {
  build,
  generateAnchorPoints,
};
