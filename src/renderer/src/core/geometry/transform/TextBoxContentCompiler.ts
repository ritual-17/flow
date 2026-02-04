export const TextBoxContentCompiler = {
  compileTextBoxContent,
};

export async function compileTextBoxContent(content: string): Promise<HTMLImageElement> {
  try {
    const svg = await window.api.compileTypst(content);

    const img = await svgStringToImage(svg);
    return img;
  } catch (err) {
    console.error('Typst compile failed:', err);
    throw err;
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
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
