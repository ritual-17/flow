import { buildBaseShape, IShapeBase, ShapeId } from '@renderer/core/geometry/Shape';

export const PDF = {
  build,
};
export type PdfId = string;
export type PdfSlideId = string;

export interface PdfSource {
  id: PdfId;
  name: string;
  filePath: string;
  pageCount: number;
  importedAt: Date;
}

export type PdfSlide = IShapeBase & {
  id: ShapeId;
  x: number;
  y: number;
  width: number;
  height: number;

  // MVP: data URL for Konva to display
  imageDataUrl: string;
};

export function build(attrs: Partial<PdfSlide>): PdfSlide {
  return {
    width: 100,
    height: 100,
    imageDataUrl: '',
    ...buildBaseShape(),
    ...attrs,
  };
}
