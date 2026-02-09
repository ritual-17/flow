// Handles manipulation commands i.e. commands for manipulating shapes and updating the document accordingly

import { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import { Document, DocumentModel } from '@renderer/core/document/Document';
import {
  clearBoxSelectAnchor,
  clearSelection,
  Editor,
  setClipboard,
  setCurrentLineId,
  setMode,
  setStatus,
} from '@renderer/core/editor/Editor';
import { AnchorRef, Shape, ShapeId } from '@renderer/core/geometry/Shape';
import * as Circle from '@renderer/core/geometry/shapes/Circle';
import * as MultiLine from '@renderer/core/geometry/shapes/MultiLine';
import * as Point from '@renderer/core/geometry/shapes/Point';
import { TextBox } from '@renderer/core/geometry/shapes/TextBox';
import {
  cloneShape,
  getSelectionCenter,
  translateShape,
  updateTextBoxContent,
} from '@renderer/core/geometry/Transform';
import { getAnchorPoint } from '@renderer/core/geometry/utils/AnchorPoints';

import { SpatialIndex } from '../geometry/SpatialIndex';

export function createCircle(args: CommandArgs): [Editor, DocumentModel] {
  const { x, y } = args.editor.cursorPosition;
  const circle = Circle.build({ x, y });

  const updatedDocument = addShapeToDocument(args, circle);

  return [args.editor, updatedDocument];
}

export async function createTextBox(args: CommandArgs): Promise<[Editor, DocumentModel]> {
  const { x, y } = args.editor.cursorPosition;
  const textBox = TextBox.build({ x, y });

  const compiledTextBox = await updateTextBoxContent(textBox, textBox.text);

  const updatedDocument = addShapeToDocument(args, compiledTextBox);

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

  if (selectedShapeIds.length === 0) {
    throw new Error('No shapes selected to translate');
  }

  let updatedEditor = editor;
  updatedEditor = clearBoxSelectAnchor(updatedEditor);

  const updatedShapes = selectedShapeIds
    .map((id) => Document.getShapeById(document, id))
    .map((shape) => translateShape(shape, { deltaX, deltaY }));

  const updatedDocument = updateShapesInDocument(
    { ...args, editor: updatedEditor, document },
    updatedShapes,
  );

  return [updatedEditor, updatedDocument];
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

/*
 * Functon that creates a new point usabel for lines.
 * Also sets the currentLineId to the new point
 */
export function startNewLine(args: CommandArgs): CommandResult {
  const { editor, document } = args;

  let updatedEditor = editor;
  let updatedDocument = document;

  const { x, y } = args.editor.cursorPosition;
  const currentPoint = Point.build({
    x: x,
    y: y,
  });
  updatedEditor = setCurrentLineId(updatedEditor, currentPoint.id);
  updatedDocument = addShapeToDocument(args, currentPoint);
  return [updatedEditor, updatedDocument];
}

/*
 * Function that attempts to add a point to the currently selected line.
 * If no line is selected then it will create a point for a line to base off of
 */
export function addPointToLine(args: CommandArgs): CommandResult {
  const { editor, document } = args;

  let updatedEditor = editor;
  let updatedDocument = document;
  const currentLineId = editor.currentLineId;
  if (!currentLineId) {
    // need to add a point rather than a line because we only have one point so far
    return startNewLine(args);
  }

  const { x, y } = args.editor.cursorPosition;
  const currentPoint = Point.build({
    x: x,
    y: y,
  });
  const currentLine = Document.getShapeById(updatedDocument, currentLineId);
  switch (currentLine.type) {
    case 'point': {
      let newLine = MultiLine.fromStartingPoint(currentLine, { id: currentLine.id });
      newLine = MultiLine.addPoint(newLine, currentPoint);

      updatedDocument = updateShapeInDocument(
        { ...args, editor: updatedEditor, document: updatedDocument },
        newLine,
      );

      updatedEditor = setCurrentLineId(updatedEditor, newLine.id);
      return [updatedEditor, updatedDocument];
    }
    case 'multi-line': {
      const updatedLine = MultiLine.addPoint(currentLine, currentPoint);
      updatedDocument = updateShapeInDocument(
        { ...args, editor: updatedEditor, document: updatedDocument },
        updatedLine,
      );

      return [updatedEditor, updatedDocument];
    }
    default:
      throw new Error(
        `Shape with id ${currentLine.id} is not a line or point, cannot add another point`,
      );
  }
}

export function deleteSelection(args: CommandArgs): [Editor, DocumentModel] {
  const { editor, document, spatialIndex } = args;
  const { selectedShapeIds } = editor;

  // not fully needed but avoids unnecessary document updates
  if (selectedShapeIds.length === 0) {
    return [editor, document];
  }

  // update document and editor with following changes
  const result = helperRemoveShapes(document, editor, spatialIndex, selectedShapeIds);
  const updatedDocument = result[0];
  let updatedEditor = result[1];
  updatedEditor = setMode(updatedEditor, 'normal');

  return [updatedEditor, updatedDocument];
}

export function yankSelection(args: CommandArgs): [Editor, DocumentModel] {
  const { editor, document } = args;
  const { selectedShapeIds } = editor;

  if (selectedShapeIds.length === 0) {
    return [editor, document];
  }

  const selectedShapes = editor.selectedShapeIds.map((id) => Document.getShapeById(document, id));

  const center = getSelectionCenter(selectedShapes);

  // copy and translate to origin
  const shapesToYank = selectedShapes.map((shape) =>
    translateShape(structuredClone(shape), {
      deltaX: -center.x,
      deltaY: -center.y,
    }),
  ); // deep copy

  const count = shapesToYank.length;
  const word = count === 1 ? 'object' : 'objects';

  let updatedEditor = editor;
  updatedEditor = setClipboard(updatedEditor, shapesToYank);
  updatedEditor = setStatus(updatedEditor, `${count} ${word} yanked`);
  updatedEditor = clearSelection(updatedEditor);
  updatedEditor = clearBoxSelectAnchor(updatedEditor);
  updatedEditor = setMode(updatedEditor, 'normal');

  return [updatedEditor, document];
}

export function paste(args: CommandArgs): CommandResult {
  const { editor, document, spatialIndex } = args;
  if (editor.clipboard.length === 0) {
    return [editor, document];
  }
  let updatedDocument = document;
  let updatedEditor = editor;

  // delete any current selection before pasting
  if (editor.selectedShapeIds.length > 0) {
    const result = helperRemoveShapes(document, editor, spatialIndex, editor.selectedShapeIds);
    updatedDocument = result[0];
    updatedEditor = result[1];
  }

  const cursor = updatedEditor.cursorPosition;

  // 1. Clone with new IDs, 2. Position at cursor, 3. Insert each into document (via loop),
  const cloned = updatedEditor.clipboard.map(cloneShape);
  const position = cloned.map((shape) =>
    translateShape(shape, { deltaX: cursor.x, deltaY: cursor.y }),
  );

  for (const shape of position) {
    updatedDocument = addShapeToDocument({ ...args, document: updatedDocument }, shape);
  }

  return [updatedEditor, updatedDocument];
}

// functions to handle undo and redo commands
export function undo(args: CommandArgs): CommandResult {
  const { editor, document, history } = args;
  if (!history.canUndo()) return [editor, document];

  const prevDocument = history.undo(document);
  return [editor, prevDocument];
}

export function redo(args: CommandArgs): CommandResult {
  const { editor, document, history } = args;
  if (!history.canRedo()) return [editor, document];

  const nextDocument = history.redo(document);
  return [editor, nextDocument];
}

function helperRemoveShapes(
  document: DocumentModel,
  editor: Editor,
  spatialIndex: SpatialIndex,
  shapeIds: ShapeId[],
): [DocumentModel, Editor] {
  const updatedDocument = Document.removeShapesFromDocument(document, shapeIds);
  spatialIndex.removeShapesByIds(shapeIds);
  let updatedEditor = clearSelection(editor);
  updatedEditor = clearBoxSelectAnchor(updatedEditor);
  return [updatedDocument, updatedEditor];
}

export function updateShapeInDocument(args: CommandArgs, shape: Shape): DocumentModel {
  return updateShapesInDocument(args, [shape]);
}

function updateShapesInDocument(args: CommandArgs, shapes: Shape[]): DocumentModel {
  const { document, spatialIndex } = args;
  const newDocument = Document.updateShapesInDocument(document, shapes);

  shapes.forEach((shape) => spatialIndex.updateShape(shape));
  return newDocument;
}

function addShapeToDocument(args: CommandArgs, shape: Shape): DocumentModel {
  const { document, spatialIndex } = args;
  const newDocument = Document.addShapesToDocument(document, [shape]);
  spatialIndex.addShape(shape);
  return newDocument;
}
