import { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import {
  addShapeToDocument,
  updateShapeInDocument,
} from '@renderer/core/commands/ManipulationCommands';
import { Document } from '@renderer/core/document/Document';
import { setCurrentLineId, setPreviousShapeId } from '@renderer/core/editor/Editor';
import { AnchorRef, Coordinate, Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { Circle } from '@renderer/core/geometry/shapes/Circle';
import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import { Point } from '@renderer/core/geometry/shapes/Point';
import { Rectangle } from '@renderer/core/geometry/shapes/Rectangle';
import { Square } from '@renderer/core/geometry/shapes/Square';
import { TextBox } from '@renderer/core/geometry/shapes/TextBox';
import { Transform } from '@renderer/core/geometry/Transform';
import { resolvePointCoordinate } from '@renderer/core/geometry/utils/AnchorPoints';

export function autoLinkCircle(args: CommandArgs): CommandResult {
  const { x, y } = args.editor.cursorPosition;
  const circle = Circle.build({ x, y });

  const updatedDocument = addShapeToDocument(args, circle);
  return autoLinkAddToLine({ ...args, document: updatedDocument }, circle);
}

export function autoLinkRectangle(args: CommandArgs): CommandResult {
  const { x, y } = args.editor.cursorPosition;
  const rectangle = Rectangle.build({ x, y });

  const updatedDocument = addShapeToDocument(args, rectangle);
  return autoLinkAddToLine({ ...args, document: updatedDocument }, rectangle);
}

export function autoLinkSquare(args: CommandArgs): CommandResult {
  const { x, y } = args.editor.cursorPosition;
  const square = Square.build({ x, y });

  const updatedDocument = addShapeToDocument(args, square);
  return autoLinkAddToLine({ ...args, document: updatedDocument }, square);
}

export async function autoLinkTextBox(args: CommandArgs): Promise<CommandResult> {
  const { x, y } = args.editor.cursorPosition;
  const textBox = await Transform.compileShapeTextContent(TextBox.build({ x, y }));

  const updatedDocument = addShapeToDocument(args, textBox);
  return autoLinkAddToLine({ ...args, document: updatedDocument }, textBox);
}

export function autoLinkAddToLine(
  args: CommandArgs,
  newShape?: Exclude<Shape, MultiLine | Point>,
): CommandResult {
  let { document: updatedDocument, editor: updatedEditor } = args;

  if (!updatedEditor.previousShapeId) {
    const previousShape =
      newShape ||
      Point.build({
        x: updatedEditor.cursorPosition.x,
        y: updatedEditor.cursorPosition.y,
      });
    updatedDocument = addShapeToDocument(args, previousShape);
    updatedEditor = setPreviousShapeId(updatedEditor, previousShape.id);
    return [updatedEditor, updatedDocument];
  }
  const previousShape = Document.getShapeById(updatedDocument, updatedEditor.previousShapeId);
  if (!previousShape) {
    throw new Error(`Previous shape with ID ${updatedEditor.previousShapeId} not found`);
  }
  let newLine: MultiLine;
  switch (previousShape.type) {
    case 'multi-line': {
      const lastPoint = MultiLine.getLastPoint(previousShape);
      const nextPoint = newShape
        ? getNewShapePoint(args, newShape, lastPoint)
        : updatedEditor.cursorPosition;
      console.log('Next point for new multi-line:', nextPoint);

      newLine = MultiLine.addPoint(previousShape, nextPoint);
      updatedDocument = updateShapeInDocument(
        { ...args, document: updatedDocument, editor: updatedEditor },
        newLine,
      );
      updatedEditor = setPreviousShapeId(updatedEditor, newShape?.id || newLine.id);
      updatedEditor = setCurrentLineId(updatedEditor, newLine.id);
      break;
    }
    case 'point': {
      const lastPoint = previousShape;
      const nextPoint = newShape
        ? getNewShapePoint(args, newShape, lastPoint)
        : updatedEditor.cursorPosition;

      newLine = MultiLine.build({
        id: previousShape.id, // reuse the same ID to replace the point with a line
        points: [previousShape, nextPoint],
      });
      updatedDocument = updateShapeInDocument(
        { ...args, document: updatedDocument, editor: updatedEditor },
        newLine,
      );
      updatedEditor = setPreviousShapeId(updatedEditor, newShape?.id || newLine.id);
      updatedEditor = setCurrentLineId(updatedEditor, newLine.id);
      break;
    }
    default: {
      const lastPoint = getPreviousShapePoint(args, updatedEditor.previousShapeId);
      const nextPoint = newShape
        ? getNewShapePoint(args, newShape, lastPoint)
        : updatedEditor.cursorPosition;
      newLine = MultiLine.build({
        points: [lastPoint, nextPoint],
      });
      updatedDocument = addShapeToDocument(
        { ...args, document: updatedDocument, editor: updatedEditor },
        newLine,
      );
      updatedEditor = setPreviousShapeId(updatedEditor, newShape?.id || newLine.id);
      updatedEditor = setCurrentLineId(updatedEditor, newLine.id);
    }
  }
  return [updatedEditor, updatedDocument];
}

function getPreviousShapePoint(args: CommandArgs, previousShapeId: ShapeId): AnchorRef {
  const { editor, spatialIndex } = args;
  const point = spatialIndex.getNearestAnchorRef(editor.cursorPosition, previousShapeId);
  if (!point) {
    throw new Error(`No anchor point found for shape with ID ${editor.previousShapeId}`);
  }
  return point;
}

function getNewShapePoint(
  args: CommandArgs,
  newShape: Exclude<Shape, MultiLine | Point>,
  previousPoint: Coordinate | AnchorRef,
): AnchorRef {
  const coord = resolvePointCoordinate(args.document, previousPoint);
  const point = args.spatialIndex.getNearestAnchorRef(coord, newShape.id);
  if (!point) {
    throw new Error(`No anchor point found for new shape with ID ${newShape.id}`);
  }
  return point;
}
