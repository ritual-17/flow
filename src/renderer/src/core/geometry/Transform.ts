// Transformation utilities for shapes, e.g. rotate, scale, translate
//

import { Shape } from '@renderer/core/geometry/Shape';
import { TextBox } from '@renderer/core/geometry/shapes/TextBox';
import { TextBoxContentCompiler } from '@renderer/core/geometry/transform/TextBoxContentCompiler';

export function translateShape(
  shape: Shape,
  { deltaX, deltaY }: { deltaX: number; deltaY: number },
): Shape {
  return {
    ...shape,
    x: shape.x + deltaX,
    y: shape.y + deltaY,
  };
}

export async function updateTextBoxContent(textBox: TextBox, newText: string): Promise<TextBox> {
  const compiledImage = await TextBoxContentCompiler.compileTextBoxContent(newText);

  return {
    ...textBox,
    compiledImage,
    text: newText,
  };
}

export {};
