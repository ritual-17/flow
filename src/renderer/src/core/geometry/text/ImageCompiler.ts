import { Shape } from '@renderer/core/geometry/Shape';

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
  _shape: Shape,
  image: HTMLImageElement,
): { width: number; height: number } {
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
