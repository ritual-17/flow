import { Shape } from '@renderer/core/geometry/Shape';
import { TextBox } from '@renderer/core/geometry/shapes/TextBox';

export const ImageCompiler = {
  compileFromText,
  getScaledDimensions,
};

export async function compileFromText(content: string): Promise<HTMLImageElement> {
  try {
    const svg = await window.api.compileTypst(content);

    const img = await svgStringToImage(svg);
    return img;
  } catch (err) {
    console.error('Typst compile failed:', err);
    throw err;
  }
}

// Calculate the scaling factor to fit the image within the text box dimensions
export function getScaledDimensions(
  shape: Shape,
  image: HTMLImageElement,
): { width: number; height: number } {
  if (shape.type === 'textBox') {
    return resolveTextBoxDimensions(shape, image);
  } else {
    return resolveLabelDimensions(shape, image);
  }
}

function resolveTextBoxDimensions(_textBox: TextBox, image: HTMLImageElement) {
  // potentially scale the image down to fit within the text box dimensions, while maintaining aspect ratio
  // const widthScale = textBox.width / image.width;
  // const heightScale = textBox.height / image.height;
  // for now just use image height
  const heightScale = 1;
  const widthScale = 1;
  const scaler = Math.min(widthScale, heightScale);
  return {
    width: image.width * scaler,
    height: image.height * scaler,
  };
}

function resolveLabelDimensions(shape: Exclude<Shape, TextBox>, image: HTMLImageElement) {
  const { width: labelWidth, height: labelHeight } = image;
  const { width: shapeWidth, height: shapeHeight } = getShapeDimensions(shape);

  // if the label is larger than the shape, we need to scale it down to fit within the shape
  const widthScale = shapeWidth > 0 ? Math.min(1, shapeWidth / labelWidth) : 1;
  const heightScale = shapeHeight > 0 ? Math.min(1, shapeHeight / labelHeight) : 1;
  const scale = Math.min(widthScale, heightScale);

  return {
    width: labelWidth * scale,
    height: labelHeight * scale,
  };
}

// this could be moved to a util file for better reusability and visibility, but for now it's only used here
function getShapeDimensions(shape: Shape) {
  switch (shape.type) {
    case 'circle':
      return { width: shape.radius * 2, height: shape.radius * 2 };
    case 'rectangle':
      return { width: shape.width, height: shape.height };
    case 'square':
      return { width: shape.width, height: shape.height };
    default:
      return { width: 0, height: 0 };
  }
}

async function svgStringToImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      reject(e);
    };
    img.src = url;
  });
}
