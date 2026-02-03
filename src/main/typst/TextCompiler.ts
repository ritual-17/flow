import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';
export async function compileTypstDocument() {
  const $typst = NodeCompiler.create();
  // const content = '$X_A = integral_0^infinity x d x$';
  const content =
    'System: $ mat(-0.9, 0.1, 0; 0.6, -0.4, 0.1; 0.3, 0.3, -0.1; 1, 1, 1)pi = mat(0;0;0;1) \\ $';
  const typstContent = docHeaders() + content;
  const svg = $typst.svg({ mainFileContent: typstContent });

  return svg;
}

function docHeaders() {
  return `#set page(width: auto, height: auto, margin: 10pt)
#set text(font: "DejaVu Sans", size: 30pt)

`;
}
