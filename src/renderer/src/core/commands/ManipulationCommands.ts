// Handles manipulation commands i.e. commands for manipulating shapes and updating the document accordingly

import { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import * as Document from '@renderer/core/document/Document';
import {
  clearBoxSelectAnchor,
  clearSelection,
  Editor,
  setCurrentLineId,
  setMode,
} from '@renderer/core/editor/Editor';
import { AnchorRef, Shape } from '@renderer/core/geometry/Shape';
import * as Circle from '@renderer/core/geometry/shapes/Circle';
import * as MultiLine from '@renderer/core/geometry/shapes/MultiLine';
import { translateShape } from '@renderer/core/geometry/Transform';
import { getAnchorPoint } from '@renderer/core/geometry/utils/AnchorPoints';

export function createCircle(args: CommandArgs): [Editor, Document.DocumentModel] {
  const { x, y } = args.editor.cursorPosition;
  const circle = Circle.build({ x, y });

  const updatedDocument = addShapeToDocument(args, circle);

  return [args.editor, updatedDocument];
}

const TRANSLATE_AMOUNT = 50;
export function translateSelectionUp(args: CommandArgs): [Editor, Document.DocumentModel] {
  return translateSelection(args, { deltaX: 0, deltaY: -TRANSLATE_AMOUNT });
}
export function translateSelectionDown(args: CommandArgs): [Editor, Document.DocumentModel] {
  return translateSelection(args, { deltaX: 0, deltaY: TRANSLATE_AMOUNT });
}
export function translateSelectionLeft(args: CommandArgs): [Editor, Document.DocumentModel] {
  return translateSelection(args, { deltaX: -TRANSLATE_AMOUNT, deltaY: 0 });
}
export function translateSelectionRight(args: CommandArgs): [Editor, Document.DocumentModel] {
  return translateSelection(args, { deltaX: TRANSLATE_AMOUNT, deltaY: 0 });
}

function translateSelection(
  args: CommandArgs,
  { deltaX, deltaY }: { deltaX: number; deltaY: number },
): [Editor, Document.DocumentModel] {
  const { editor, document } = args;
  const { selectedShapeIds } = editor;

  if (selectedShapeIds.length === 0) {
    throw new Error('No shapes selected to translate');
  }

  const updatedShapes = selectedShapeIds
    .map((id) => Document.getShapeById(document, id))
    .map((shape) => translateShape(shape, { deltaX, deltaY }));

  const updatedDocument = updateShapesInDocument({ ...args, editor, document }, updatedShapes);

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

  const currentLine = Document.getShapeById(updatedDocument, currentLineId);
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

      return [updatedEditor, updatedDocument];
    }
    default:
      throw new Error(
        `Shape with id ${currentLine.id} is not a line or point, cannot add anchor point`,
      );
  }
}

export function deleteSelection(args: CommandArgs): [Editor, Document.DocumentModel] {
  const { editor, document } = args;
  const { selectedShapeIds } = editor;

  // not fully needed but avoids unnecessary document updates
  if (selectedShapeIds.length === 0) {
    return [editor, document];
  }

  // update document and editor with following changes
  const updatedDocument = Document.removeShapesFromDocument(document, selectedShapeIds);

  let updatedEditor = editor;
  updatedEditor = clearSelection(updatedEditor);
  updatedEditor = clearBoxSelectAnchor(updatedEditor);
  updatedEditor = setMode(updatedEditor, 'normal');

  return [updatedEditor, updatedDocument];
}

function updateShapeInDocument(args: CommandArgs, shape: Shape): Document.DocumentModel {
  return updateShapesInDocument(args, [shape]);
}

function updateShapesInDocument(args: CommandArgs, shapes: Shape[]): Document.DocumentModel {
  const { document, spatialIndex } = args;
  const newDocument = Document.updateShapesInDocument(document, shapes);

  shapes.forEach((shape) => spatialIndex.updateShape(shape));
  return newDocument;
}

function addShapeToDocument(args: CommandArgs, shape: Shape): Document.DocumentModel {
  const { document, spatialIndex } = args;
  const newDocument = Document.addShapesToDocument(document, [shape]);
  spatialIndex.addShape(shape);
  return newDocument;
}
