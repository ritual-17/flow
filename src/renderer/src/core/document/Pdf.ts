export type PdfId = string;
export type PdfSlideId = string;

export interface PdfSource {
  id: PdfId;
  name: string;
  filePath: string;
  pageCount: number;
  importedAt: Date;
}

export interface PdfSlide {
  id: PdfSlideId;
  pdfId: PdfId;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;

  // MVP: data URL for Konva to display
  imageDataUrl: string;
}
