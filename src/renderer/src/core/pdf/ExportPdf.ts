import { jsPDF } from 'jspdf';
import Konva from 'konva';

const CANVAS_BACKGROUND = '#1e1f22';

import { DocumentModel } from '@renderer/core/document/Document';
import { Shape } from '@renderer/core/geometry/Shape';
import { isAnchorRef } from '@renderer/core/geometry/utils/AnchorPoints';

const PADDING = 40;

function getShapeBounds(shape: Shape): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  switch (shape.type) {
    case 'circle':
      return {
        minX: shape.x - shape.radius,
        minY: shape.y - shape.radius,
        maxX: shape.x + shape.radius,
        maxY: shape.y + shape.radius,
      };
    case 'rectangle':
    case 'square':
    case 'pdf':
      return {
        minX: shape.x - shape.width / 2,
        minY: shape.y - shape.height / 2,
        maxX: shape.x + shape.width / 2,
        maxY: shape.y + shape.height / 2,
      };
    case 'textBox': {
      const w = shape.label.compiledImageMeta?.width ?? shape.width;
      const h = shape.label.compiledImageMeta?.height ?? shape.height;
      return {
        minX: shape.x - w / 2,
        minY: shape.y - h / 2,
        maxX: shape.x + w / 2,
        maxY: shape.y + h / 2,
      };
    }
    case 'multi-line': {
      const coords = shape.points.filter((p) => !isAnchorRef(p)) as {
        x: number;
        y: number;
      }[];
      if (coords.length === 0) {
        return { minX: shape.x, minY: shape.y, maxX: shape.x, maxY: shape.y };
      }
      const xs = coords.map((p) => p.x);
      const ys = coords.map((p) => p.y);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
    default:
      return { minX: shape.x, minY: shape.y, maxX: shape.x, maxY: shape.y };
  }
}

export async function exportToPdf(document: DocumentModel): Promise<void> {
  const shapes = document.shapes.values().toArray();
  if (shapes.length === 0) return;

  // Calculate bounding box of all shapes
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const shape of shapes) {
    const bounds = getShapeBounds(shape);
    minX = Math.min(minX, bounds.minX);
    minY = Math.min(minY, bounds.minY);
    maxX = Math.max(maxX, bounds.maxX);
    maxY = Math.max(maxY, bounds.maxY);
  }

  const exportWidth = maxX - minX + PADDING * 2;
  const exportHeight = maxY - minY + PADDING * 2;

  const stage = Konva.stages[0];
  if (!stage) throw new Error('No Konva stage found');

  const layer = stage.getLayers()[0];

  // Save current state including viewport transform
  const origWidth = stage.width();
  const origHeight = stage.height();
  const origLayerX = layer.x();
  const origLayerY = layer.y();
  const origStageX = stage.x();
  const origStageY = stage.y();
  const origScaleX = stage.scaleX();
  const origScaleY = stage.scaleY();

  // Reset viewport transform and expand stage to fit all content
  stage.x(0);
  stage.y(0);
  stage.scaleX(1);
  stage.scaleY(1);
  stage.width(exportWidth);
  stage.height(exportHeight);
  layer.x(-minX + PADDING);
  layer.y(-minY + PADDING);
  stage.batchDraw();

  // Add a background layer matching the canvas colour
  const bgLayer = new Konva.Layer();
  const bgRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: exportWidth,
    height: exportHeight,
    fill: CANVAS_BACKGROUND,
    listening: false,
  });
  bgLayer.add(bgRect);
  stage.add(bgLayer);
  bgLayer.moveToBottom();
  stage.batchDraw();

  // Split content into A4-proportioned pages
  const pageHeight = Math.ceil(exportWidth * (297 / 210));
  const numPages = Math.ceil(exportHeight / pageHeight);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [exportWidth, pageHeight],
    hotfixes: ['px_scaling'],
  });

  for (let page = 0; page < numPages; page++) {
    const sliceY = page * pageHeight;
    const sliceHeight = Math.min(pageHeight, exportHeight - sliceY);

    const dataURL = stage.toDataURL({
      x: 0,
      y: sliceY,
      width: exportWidth,
      height: sliceHeight,
      mimeType: 'image/jpeg',
      quality: 0.85,
      pixelRatio: 1,
    });

    if (page > 0) pdf.addPage([exportWidth, pageHeight], 'portrait');
    pdf.addImage(dataURL, 'JPEG', 0, 0, exportWidth, sliceHeight);
  }

  // Remove background layer
  bgLayer.destroy();

  // Restore original state
  stage.width(origWidth);
  stage.height(origHeight);
  layer.x(origLayerX);
  layer.y(origLayerY);
  stage.x(origStageX);
  stage.y(origStageY);
  stage.scaleX(origScaleX);
  stage.scaleY(origScaleY);
  stage.batchDraw();

  const pdfBuffer = pdf.output('arraybuffer');
  await window.api.pdf.export(pdfBuffer);
}
