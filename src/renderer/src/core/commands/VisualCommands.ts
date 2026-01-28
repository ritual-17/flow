// Handles visual commands i.e. commands that do not manipulate shapes, but involve some visual change.
//
// e.g. select the closest shape, select the shapes in this region
//
// determine if this makes more sense to be handled here or in the renderer layer, since technically this is tightly coupled to rendering and not the documents.
// VisualCommands should operate on editor state, related to selection and visual modes

import { DocumentModel } from '@renderer/core/document/Document';
import { Editor } from '@renderer/core/editor/Editor';
import { SpatialIndex } from '@renderer/core/geometry/SpatialIndex';
import { produce } from 'immer';

function yankSelectedShapes(editor: Editor, document: DocumentModel): Editor {
  const selectedShapes = editor.selectedShapeIds
    .map((id) => document.shapes.get(id))
    .filter((shape) => shape !== undefined);

  return produce(editor, (draft) => {
    draft.clipboard = selectedShapes;
  });
}

function selectShapesInArea(
  editor: Editor,
  spatialIndex: SpatialIndex,
  area: { xMin: number; xMax: number; yMin: number; yMax: number },
): Editor {
  const shapesInArea = spatialIndex.searchInArea(area);
  const shapeIdsInArea = shapesInArea.map((shape) => shape.id);

  return produce(editor, (draft) => {
    draft.selectedShapeIds = shapeIdsInArea;
  });
}

// helper function to select the closest shape to a point within a tolerance
function selectClosestShapeAtPoint(
  editor: Editor,
  spatialIndex: SpatialIndex,
  point: { x: number; y: number },
  tolerance: number = 5,
): Editor {
  // search for shapes within the tolerance box
  const candidateShapes = spatialIndex.searchInArea({
    xMin: point.x - tolerance,
    xMax: point.x + tolerance,
    yMin: point.y - tolerance,
    yMax: point.y + tolerance,
  });

  if (candidateShapes.length === 0) {
    return editor; // No shapes found within tolerance
  }

  // find the closest shape among the candidates
  const closestShape = candidateShapes.reduce((best, curr) => {
    if (!best) return curr;
    const bestDistance = spatialIndex.distanceBetweenShapes(best, curr);
    if (bestDistance <= 0)
      return best; // same shape
    else return curr;
  });

  return produce(editor, (draft) => {
    draft.selectedShapeIds = [closestShape.id];
  });
}

export { yankSelectedShapes, selectShapesInArea, selectClosestShapeAtPoint };
