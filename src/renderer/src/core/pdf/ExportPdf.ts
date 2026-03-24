import Konva from 'konva';
import { jsPDF } from 'jspdf';

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
    case 'textBox':
    case 'pdf':
      return {
        minX: shape.x,
        minY: shape.y,
        maxX: shape.x + shape.width,
        maxY: shape.y + shape.height,
      };
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

  // Save current state
  const origWidth = stage.width();
  const origHeight = stage.height();
  const origX = layer.x();
  const origY = layer.y();

  // Expand stage and shift layer so all content is visible
  stage.width(exportWidth);
  stage.height(exportHeight);
  layer.x(-minX + PADDING);
  layer.y(-minY + PADDING);
  stage.batchDraw();

  const dataURL = stage.toDataURL({ pixelRatio: 2 });

  // Restore original state
  stage.width(origWidth);
  stage.height(origHeight);
  layer.x(origX);
  layer.y(origY);
  stage.batchDraw();

  // Build PDF sized to the content
  const orientation = exportWidth >= exportHeight ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [exportWidth, exportHeight],
    hotfixes: ['px_scaling'],
  });

  pdf.addImage(dataURL, 'PNG', 0, 0, exportWidth, exportHeight);

  const pdfBuffer = pdf.output('arraybuffer');
  await window.api.pdf.export(pdfBuffer);
}
