// Handles visual commands i.e. commands that do not manipulate shapes, but involve some visual change.
//
// e.g. select the closest shape, select the shapes in this region
//
// TODO: determine if this makes more sense to be handled here or in the renderer layer, since technically this is tightly coupled to rendering and not the documents.

import { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import { DocumentModel } from '@renderer/core/document/Document';
import { Editor } from '@renderer/core/editor/Editor';
import { Direction } from '@renderer/core/geometry/SpatialIndex';
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
