// Transformation utilities for shapes, e.g. rotate, scale, translate

import { Shape } from '@renderer/core/geometry/Shape';
import {
  dimensionScaler,
  TextBoxContentCompiler,
} from '@renderer/core/geometry/transform/TextBoxContentCompiler';
import { generateId } from '@renderer/core/utils/id';

// this is done this way so the data stays immutable
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

export async function compileShape(shape: Shape): Promise<Shape> {
  try {
    if (shape.type === 'textBox') {
      return await updateTextBoxContent(shape, shape.label.text);
    }
    const compiledHTML = await TextBoxContentCompiler.compileTextBoxContent(shape.label.text);

    const { width: scaledWidth, height: scaledHeight } = dimensionScaler(shape, compiledHTML);

    const compiledImageMeta: Shape['label']['compiledImageMeta'] = {
      src: compiledHTML.src,
      width: scaledWidth,
      height: scaledHeight,
    };

    return {
      ...shape,
      label: {
        ...shape.label,
        compiledImageMeta,
      },
    };
  } catch {
    return shape;
  }
}

/**
throws error if compilation fails. this is important because it prevents
the user from exiting text editing mode while the content is in a bad
state.
**/
export async function updateTextBoxContent(shape: Shape, newText: string): Promise<Shape> {
  const compiledHTMLElement = await TextBoxContentCompiler.compileTextBoxContent(newText);
  const { width: scaledWidth, height: scaledHeight } = dimensionScaler(shape, compiledHTMLElement);

  const compiledImageMeta: Shape['label']['compiledImageMeta'] = {
    src: compiledHTMLElement.src,
    width: scaledWidth,
    height: scaledHeight,
  };

  return {
    ...shape,
    label: {
      text: newText,
      compiledImageMeta,
    },
  };
}

export function cloneShape(shape: Shape): Shape {
  return {
    ...shape,
    id: generateId(),
    anchorPoints: shape.anchorPoints.map((a) => ({
      ...a,
      ownerId: shape.id,
    })),
  };
}

export function getSelectionCenter(shapes: Shape[]): { x: number; y: number } {
  const xs = shapes.map((s) => s.x);
  const ys = shapes.map((s) => s.y);

  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}

export const Transform = {
  translateShape,
  compileShape,
  updateTextBoxContent,
  cloneShape,
  getSelectionCenter,
};
