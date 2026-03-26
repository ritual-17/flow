import { useStore } from '@renderer/ui/Store';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min?url';

import { PDF, PdfSlide } from '../geometry/shapes/PdfSlide';
import { generateId } from '../utils/id';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export async function generatePdfSlides(): Promise<PdfSlide[] | null> {
  const rawPdfData = await window.api.pdf.pick();
  if (!rawPdfData) return null;

  const { viewport } = useStore.getState();
  const loadingTask = pdfjsLib.getDocument({ data: rawPdfData.data });
  const pdf = await loadingTask.promise;

  const pageCount = pdf.numPages;

  const slides: PdfSlide[] = [];

  // OneNote-style stacking: pages down the canvas
  const startX = viewport.x + 50;
  let currentY = viewport.y + 10;

  // Adjust scale here
  const scale = 1.5;

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context for PDF render');

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const imageDataUrl = canvas.toDataURL('image/png');

    // const slideWidth = canvas.width * (2 / 3);
    // const slideHeight = canvas.height * (2 / 3);

    const slideWidth = canvas.width * 1.2;
    const slideHeight = canvas.height * 1.2;

    slides.push(
      PDF.build({
        id: generateId(),
        x: startX,
        y: currentY,
        width: slideWidth,
        height: slideHeight,
        imageDataUrl,
      }),
    );

    currentY += slideHeight + 20;
  }

  return slides;
}
