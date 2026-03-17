import { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import {
  addShapeToDocument,
  updateShapeInDocument,
} from '@renderer/core/commands/ManipulationCommands';
import { Document } from '@renderer/core/document/Document';
import { setPreviousShapeId } from '@renderer/core/editor/Editor';
import { AnchorRef, Coordinate, Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { Circle } from '@renderer/core/geometry/shapes/Circle';
import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import { Point } from '@renderer/core/geometry/shapes/Point';
import { isAnchorRef, resolveAnchorPoint } from '@renderer/core/geometry/utils/AnchorPoints';

export function autoLinkCircle(args: CommandArgs): CommandResult {
  const { x, y } = args.editor.cursorPosition;
  const circle = Circle.build({ x, y });

  const updatedDocument = addShapeToDocument(args, circle);
  return autoLinkAddToLine({ ...args, document: updatedDocument }, circle);
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
      updatedDocument = updateShapeInDocument(args, newLine);
      updatedEditor = setPreviousShapeId(updatedEditor, newShape?.id || newLine.id);
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
      updatedDocument = addShapeToDocument(args, newLine);
      updatedEditor = setPreviousShapeId(updatedEditor, newShape?.id || newLine.id);
    }
  }
  return [updatedEditor, updatedDocument];
}

function getPreviousShapePoint(
  args: CommandArgs,
  previousShapeId: ShapeId,
): AnchorRef | Coordinate {
  const { editor, spatialIndex } = args;
  const point = spatialIndex.getNearestAnchorPoint(editor.cursorPosition, previousShapeId);
  if (!point) {
    throw new Error(`No anchor point found for shape with ID ${editor.previousShapeId}`);
  }
  return { shapeId: previousShapeId, position: point.position };
}

function getNewShapePoint(
  args: CommandArgs,
  newShape: Exclude<Shape, MultiLine | Point>,
  previousPoint: Coordinate | AnchorRef,
): AnchorRef {
  if (isAnchorRef(previousPoint)) {
    previousPoint = resolveAnchorPoint(
      Document.getShapeById(args.document, previousPoint.shapeId)!,
      previousPoint.position,
    );
  }
  const point = args.spatialIndex.getNearestAnchorPoint(previousPoint, newShape.id);
  if (!point) {
    throw new Error(`No anchor point found for new shape with ID ${newShape.id}`);
  }
  return { shapeId: newShape.id, position: point.position };
}
