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
import * as Rectangle from '@renderer/core/geometry/shapes/Rectangle';
import { TextBox } from '@renderer/core/geometry/shapes/TextBox';
import {
  cloneShape,
  getSelectionCenter,
  Transform,
  translateShape,
} from '@renderer/core/geometry/Transform';
import { getAnchorPoint } from '@renderer/core/geometry/utils/AnchorPoints';

import { SpatialIndex } from '../geometry/SpatialIndex';

export function createCircle(args: CommandArgs): CommandResult {
  const { x, y } = args.editor.cursorPosition;
  const circle = Circle.build({ x, y });

  const updatedDocument = addShapeToDocument(args, circle);

  return [args.editor, updatedDocument];
}

export function createRectangle(args: CommandArgs): [Editor, DocumentModel] {
  const { x, y } = args.editor.cursorPosition;
  const rectangle = Rectangle.build({ x, y });

  const updatedDocument = addShapeToDocument(args, rectangle);

  return [args.editor, updatedDocument];
}

export async function createTextBox(args: CommandArgs): Promise<CommandResult> {
  const { x, y } = args.editor.cursorPosition;
  const textBox = await Transform.compileShapeTextContent(TextBox.build({ x, y }));

  const updatedDocument = addShapeToDocument(args, textBox);

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

export async function paste(args: CommandArgs): Promise<CommandResult> {
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

  // 1. Clone with new IDs, 2. Position at cursor, 3. compile, 4. Insert each into document (via loop),
  const clonedShapes = await Promise.all(
    updatedEditor.clipboard
      .map(cloneShape)
      .map((shape) => translateShape(shape, { deltaX: cursor.x, deltaY: cursor.y }))
      .map((shape) => Transform.compileShapeTextContent(shape)),
  );

  for (const shape of clonedShapes) {
    updatedDocument = addShapeToDocument({ ...args, document: updatedDocument }, shape);
  }

  return [updatedEditor, updatedDocument];
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

// Cycle arrow state for selected multi-line shapes.
// Sequence: none -> end -> both -> start -> none
export function cycleArrowOnSelection(args: CommandArgs): [Editor, DocumentModel] {
  const { editor, document } = args;
  const { selectedShapeIds } = editor;

  let updatedEditor = editor;
  updatedEditor = clearBoxSelectAnchor(updatedEditor);

  // If nothing is selected, operate on the nearest shape to the cursor
  let targetShapeIds = selectedShapeIds;

  // If we're in line-editing modes and have a currentLineId, prefer that (so toggling affects the line being created)
  if ((editor.mode === 'line' || editor.mode === 'anchor-line') && editor.currentLineId) {
    targetShapeIds = [editor.currentLineId];
  }

  // If nothing selected/targeted yet, fall back to nearest shape to cursor
  if (targetShapeIds.length === 0) {
    const nearest = args.spatialIndex.getNearestShape(editor.cursorPosition);
    if (!nearest) return [editor, document];
    targetShapeIds = [nearest.id];
  }

  const updatedShapes = targetShapeIds.map((id) => {
    const shape = Document.getShapeById(document, id);

    // If it's already a multi-line, just toggle its arrow flags
    if (shape.type === 'multi-line') {
      const start = !!shape.arrowStart;
      const end = !!shape.arrowEnd;

      let newStart = start;
      let newEnd = end;

      if (!start && !end) {
        newStart = false;
        newEnd = true;
      } else if (!start && end) {
        newStart = true;
        newEnd = true;
      } else if (start && end) {
        newStart = true;
        newEnd = false;
      } else if (start && !end) {
        newStart = false;
        newEnd = false;
      }

      return { ...shape, arrowStart: newStart, arrowEnd: newEnd } as Shape;
    }

    // If it's a single point (line being created in anchor-line/line mode), convert it into a multi-line
    if (shape.type === 'point') {
      // create multiline starting at this point and duplicate the point so we have two points
      let newLine = MultiLine.fromStartingPoint(shape, { id: shape.id });

      const secondPoint = shape.ref ? shape.ref : { x: shape.x, y: shape.y };
      newLine = MultiLine.addPoint(newLine, secondPoint);

      // starting from no-arrows, compute the new arrow state (none -> end -> both -> start -> none)
      const start = !!newLine.arrowStart;
      const end = !!newLine.arrowEnd;

      let newStart = start;
      let newEnd = end;

      if (!start && !end) {
        newStart = false;
        newEnd = true;
      } else if (!start && end) {
        newStart = true;
        newEnd = true;
      } else if (start && end) {
        newStart = true;
        newEnd = false;
      } else if (start && !end) {
        newStart = false;
        newEnd = false;
      }

      newLine = { ...newLine, arrowStart: newStart, arrowEnd: newEnd };

      // ensure editor tracks the new line id as current
      updatedEditor = setCurrentLineId(updatedEditor, newLine.id);

      return newLine as Shape;
    }

    // otherwise leave shape unchanged
    return shape;
  });

  const updatedDocument = updateShapesInDocument(
    { ...args, editor: updatedEditor, document },
    updatedShapes,
  );

  return [updatedEditor, updatedDocument];
}
