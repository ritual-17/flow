// Handles visual commands i.e. commands that do not manipulate shapes, but involve some visual change.
//
// e.g. select the closest shape, select the shapes in this region
//
// determine if this makes more sense to be handled here or in the renderer layer, since technically this is tightly coupled to rendering and not the documents.
// VisualCommands should operate on editor state, related to selection and visual modes

import { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import { DocumentModel } from '@renderer/core/document/Document';
import { Editor } from '@renderer/core/editor/Editor';
import { Direction } from '@renderer/core/geometry/SpatialIndex';
import { SpatialIndex } from '@renderer/core/geometry/SpatialIndex';
import { produce } from 'immer';

export function yankSelectedShapes(editor: Editor, document: DocumentModel): Editor {
  const selectedShapes = editor.selectedShapeIds
    .map((id) => document.shapes.get(id))
    .filter((shape) => shape !== undefined);

  return produce(editor, (draft) => {
    draft.clipboard = selectedShapes;
  });
}

export function jumpToUpAnchorPoint(args: CommandArgs): CommandResult {
  return jumpToAnchorPoint(args, 'up');
}

export function jumpToRightAnchorPoint(args: CommandArgs): CommandResult {
  return jumpToAnchorPoint(args, 'right');
}
export function jumpToDownAnchorPoint(args: CommandArgs): CommandResult {
  return jumpToAnchorPoint(args, 'down');
}
export function jumpToLeftAnchorPoint(args: CommandArgs): CommandResult {
  return jumpToAnchorPoint(args, 'left');
}

function jumpToAnchorPoint(
  { editor, document, spatialIndex }: CommandArgs,
  direction: Direction,
): CommandResult {
  const currentAnchorPoint = editor.currentAnchorPoint;
  if (!currentAnchorPoint) {
    return [editor, document];
  }

  const nextAnchorPoint = spatialIndex.getNextAnchorPoint(currentAnchorPoint, direction);
  let updatedEditor = editor;
  if (nextAnchorPoint) {
    updatedEditor = produce(editor, (draft) => {
      draft.currentAnchorPoint = nextAnchorPoint;
      draft.cursorPosition = { x: nextAnchorPoint.x, y: nextAnchorPoint.y };
    });
  }

  return [updatedEditor, document];
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
export function selectClosestShapeAtPoint(
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

export function updateVisualSelection(editor: Editor, spatialIndex: SpatialIndex): Editor {
  if (!editor.boxSelectAnchor) {
    return editor; // No visual anchor set, nothing to do
  }

  const area = {
    xMin: Math.min(editor.boxSelectAnchor.x, editor.cursorPosition.x),
    xMax: Math.max(editor.boxSelectAnchor.x, editor.cursorPosition.x),
    yMin: Math.min(editor.boxSelectAnchor.y, editor.cursorPosition.y),
    yMax: Math.max(editor.boxSelectAnchor.y, editor.cursorPosition.y),
  };

  console.log('Updating visual selection in area:', area);
  console.log('Selected IDs:', editor.selectedShapeIds);

  return selectShapesInArea(editor, spatialIndex, area);
}
