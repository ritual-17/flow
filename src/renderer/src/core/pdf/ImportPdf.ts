import { PdfId, PdfSlide, PdfSource } from '@renderer/core/document/Pdf';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

function newId(): string {
  // crypto.randomUUID is available in modern Electron; fallback included just in case
  return globalThis.crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random()}`;
}

function filePathToFileUrl(filePath: string): string {
  // Normalize Windows backslashes, then build a file URL.
  // Example Windows path: C:\Users\me\file.pdf  -> file:///C:/Users/me/file.pdf
  const normalized = filePath.replace(/\\/g, '/');

  // If it already looks like a file URL, return as-is
  if (normalized.startsWith('file://')) return normalized;

  // Windows drive letter case
  const isWindowsDrivePath = /^[A-Za-z]:\//.test(normalized);
  return isWindowsDrivePath ? `file:///${normalized}` : `file://${normalized}`;
}

export async function importPdfFromPicker(): Promise<{
  source: PdfSource;
  slides: PdfSlide[];
} | null> {
  const picked = await window.api.pdf.pick();
  if (!picked) return null;

  const pdfId: PdfId = newId();
  const url = filePathToFileUrl(picked.filePath);

  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;

  const pageCount = pdf.numPages;

  const source: PdfSource = {
    id: pdfId,
    name: picked.name,
    filePath: picked.filePath,
    pageCount,
    importedAt: new Date(),
  };

  const slides: PdfSlide[] = [];

  // OneNote-style stacking: pages down the canvas
  const startX = 50;
  let currentY = 50;

  // Adjust scale to taste; 1.5 is usually readable
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

    slides.push({
      id: newId(),
      pdfId,
      pageNumber,
      x: startX,
      y: currentY,
      width: canvas.width,
      height: canvas.height,
      imageDataUrl,
    });

    currentY += canvas.height + 20; // spacing
  }

  return { source, slides };
}
