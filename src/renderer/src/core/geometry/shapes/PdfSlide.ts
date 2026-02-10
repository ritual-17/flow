import { AnchorPoint, buildBaseShape, IShapeBase, ShapeId } from '@renderer/core/geometry/Shape';

export const PDF = {
  build,
  generateAnchorPoints,
};

export type PdfSlide = IShapeBase & {
  type: 'pdf';
  id: ShapeId;

  x: number;
  y: number;
  width: number;
  height: number;

  // rendered PDF page (canvas → dataURL)
  imageDataUrl: string;

  // optional but VERY useful later
  pdfSourceId?: string;
  pageIndex?: number; // 0-based
};

export function build(attrs: Partial<PdfSlide>): PdfSlide {
  return {
    type: 'pdf',
    width: 300,
    height: 400,
    imageDataUrl: '',
    ...buildBaseShape(),
    ...attrs,
  };
}

export function generateAnchorPoints(pdf: PdfSlide): AnchorPoint[] {
  const { x, y, width, height, id: ownerId } = pdf;

  return [
    { ownerId, position: 0, x: x + width / 2, y }, // top
    { ownerId, position: 1, x: x + width, y: y + height / 2 }, // right
    { ownerId, position: 2, x: x + width / 2, y: y + height }, // bottom
    { ownerId, position: 3, x, y: y + height / 2 }, // left
  ];
}
