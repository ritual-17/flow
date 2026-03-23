// Transformation utilities for shapes, e.g. rotate, scale, translate

import { DocumentModel } from '@renderer/core/document/Document';
import { Coordinate, Shape } from '@renderer/core/geometry/Shape';
import { ImageCompiler } from '@renderer/core/geometry/text/ImageCompiler';
import { resolveLineCoordinates } from '@renderer/core/geometry/utils/AnchorPoints';
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
export async function compileShapeTextContent<T extends Shape>(
  shape: T,
  newText?: string,
): Promise<T> {
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
  };
}

export function getSelectionCenter(document: DocumentModel, shapes: Shape[]): Coordinate {
  const points = shapes.flatMap((shape) => {
    if (shape.type === 'multi-line') {
      return resolveLineCoordinates(document, shape);
    }

    return { x: shape.x, y: shape.y };
  });

  const xs = points.map((s) => s.x);
  const ys = points.map((s) => s.y);

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
