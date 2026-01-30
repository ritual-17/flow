// Handles manipulation commands i.e. commands for manipulating shapes and updating the document accordingly

import { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import {
  addShapesToDocument,
  DocumentModel,
  getShapeById,
  updateShapesInDocument,
} from '@renderer/core/document/Document';
import { Editor, setCurrentLineId } from '@renderer/core/editor/Editor';
import { AnchorRef, Shape } from '@renderer/core/geometry/Shape';
import * as Circle from '@renderer/core/geometry/shapes/Circle';
import * as MultiLine from '@renderer/core/geometry/shapes/MultiLine';
import { translateShape } from '@renderer/core/geometry/Transform';
import { getAnchorPoint } from '@renderer/core/geometry/utils/AnchorPoints';

export function createCircle(args: CommandArgs): [Editor, DocumentModel] {
  const { x, y } = args.editor.cursorPosition;
  const circle = Circle.build({ x, y });

  const updatedDocument = addShapeToDocument(args, circle);

  return [args.editor, updatedDocument];
}

const TRANSLATE_AMOUNT = 50;
export function translateSelectionUp(args: CommandArgs): [Editor, DocumentModel] {
  return translateSelection(args, { deltaX: 0, deltaY: -TRANSLATE_AMOUNT });
}
export function translateSelectionDown(args: CommandArgs): [Editor, DocumentModel] {
  return translateSelection(args, { deltaX: 0, deltaY: TRANSLATE_AMOUNT });
}
export function translateSelectionLeft(args: CommandArgs): [Editor, DocumentModel] {
  return translateSelection(args, { deltaX: -TRANSLATE_AMOUNT, deltaY: 0 });
}
export function translateSelectionRight(args: CommandArgs): [Editor, DocumentModel] {
  return translateSelection(args, { deltaX: TRANSLATE_AMOUNT, deltaY: 0 });
}

function translateSelection(
  args: CommandArgs,
  { deltaX, deltaY }: { deltaX: number; deltaY: number },
): [Editor, DocumentModel] {
  const { editor, document } = args;
  const { selectedShapeIds } = editor;

  const currentShapeId = selectedShapeIds[0];
  const shape = getShapeById(document, currentShapeId);

  const updatedShape = translateShape(shape, { deltaX: deltaX, deltaY: deltaY });

  const updatedDocument = updateShapeInDocument({ ...args, editor, document }, updatedShape);

  return [editor, updatedDocument];
}

export function addAnchorPointToLine(args: CommandArgs): CommandResult {
  const { editor, document } = args;

  let updatedEditor = editor;
  let updatedDocument = document;

  const currentAnchorPoint = editor.currentAnchorPoint;
  const currentLineId = editor.currentLineId;

  if (!currentAnchorPoint) throw new Error('No current anchor point to add to line');

  const currentAnchorRef: AnchorRef = {
    shapeId: currentAnchorPoint.ownerId,
    position: currentAnchorPoint.position,
  };

  if (!currentLineId) {
    // need to add a point rather than a line because we only have one point so far
    const newLineStartingPoint = getAnchorPoint(updatedDocument, currentAnchorRef);

    updatedDocument = addShapeToDocument(args, newLineStartingPoint);
    updatedEditor = setCurrentLineId(updatedEditor, newLineStartingPoint.id);
    return [updatedEditor, updatedDocument];
  }

  const currentLine = getShapeById(updatedDocument, currentLineId);
  switch (currentLine.type) {
    case 'point': {
      let newLine = MultiLine.fromStartingPoint(currentLine, { id: currentLine.id });
      newLine = MultiLine.addPoint(newLine, currentAnchorRef);

      updatedDocument = updateShapeInDocument(
        { ...args, editor: updatedEditor, document: updatedDocument },
        newLine,
      );

      updatedEditor = setCurrentLineId(updatedEditor, newLine.id);
      return [updatedEditor, updatedDocument];
    }
    case 'multi-line': {
      const updatedLine = MultiLine.addPoint(currentLine, currentAnchorRef);
      updatedDocument = updateShapeInDocument(
        { ...args, editor: updatedEditor, document: updatedDocument },
        updatedLine,
      );

      console.log('Added anchor point to line', updatedLine);
      return [updatedEditor, updatedDocument];
    }
    default:
      throw new Error(
        `Shape with id ${currentLine.id} is not a line or point, cannot add anchor point`,
      );
  }
}

function updateShapeInDocument(args: CommandArgs, shape: Shape): DocumentModel {
  const { document, spatialIndex } = args;
  const newDocument = updateShapesInDocument(document, [shape]);
  spatialIndex.updateShape(shape);
  return newDocument;
}
function addShapeToDocument(args: CommandArgs, shape: Shape): DocumentModel {
  const { document, spatialIndex } = args;
  const newDocument = addShapesToDocument(document, [shape]);
  spatialIndex.addShape(shape);
  return newDocument;
}
