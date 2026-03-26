import { buildBaseShape, Coordinate, IShapeBase, ShapeId } from '@renderer/core/geometry/Shape';

export const PDF = {
  build,
  generateAnchorCoordinates,
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

export function generateAnchorCoordinates(pdf: PdfSlide): Coordinate[] {
  const { x, y, width, height } = pdf;

  return [
    { x: x + width / 2, y }, // top
    { x: x + width, y: y + height / 2 }, // right
    { x: x + width / 2, y: y + height }, // bottom
    { x, y: y + height / 2 }, // left
  ];
}
