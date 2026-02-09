// Transformation utilities for shapes, e.g. rotate, scale, translate

import { Shape } from '@renderer/core/geometry/Shape';
import { ImageCompiler } from '@renderer/core/geometry/text/ImageCompiler';
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

/**
throws error if compilation fails. this is important because it prevents
the user from exiting text editing mode while the content is in a bad
state.
**/
export async function compileShapeTextContent(shape: Shape, newText?: string): Promise<Shape> {
  const text = newText !== undefined ? newText : shape.label.text;
  const compiledHTMLElement = await ImageCompiler.compileFromText(text);
  const { width: scaledWidth, height: scaledHeight } = ImageCompiler.getScaledDimensions(
    shape,
    compiledHTMLElement,
  );

  const compiledImageMeta: Shape['label']['compiledImageMeta'] = {
    src: compiledHTMLElement.src,
    width: scaledWidth,
    height: scaledHeight,
  };

  return {
    ...shape,
    label: {
      text,
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
  compileShapeTextContent,
  cloneShape,
  getSelectionCenter,
};
