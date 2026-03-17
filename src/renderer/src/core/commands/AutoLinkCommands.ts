import { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import {
  addShapeToDocument,
  updateShapeInDocument,
} from '@renderer/core/commands/ManipulationCommands';
import { Document } from '@renderer/core/document/Document';
import { setPreviousShapeId } from '@renderer/core/editor/Editor';
import { AnchorPoint, Coordinate, Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { Circle } from '@renderer/core/geometry/shapes/Circle';
import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import { Point } from '@renderer/core/geometry/shapes/Point';
import { resolveLinePoints } from '@renderer/core/geometry/utils/AnchorPoints';

export function autoLinkCircle(args: CommandArgs): CommandResult {
  const { x, y } = args.editor.cursorPosition;
  const circle = Circle.build({ x, y });

  const updatedDocument = addShapeToDocument(args, circle);
  return linkPreviousShape({ ...args, document: updatedDocument }, circle);
}

export function autoLinkAddToLine(args: CommandArgs): CommandResult {
  let { document: updatedDocument, editor: updatedEditor } = args;
  if (!updatedEditor.previousShapeId) {
    return [updatedEditor, updatedDocument];
  }
  const previousShape = Document.getShapeById(updatedDocument, updatedEditor.previousShapeId);
  if (!previousShape) {
    throw new Error(`Previous shape with ID ${updatedEditor.previousShapeId} not found`);
  }
  let newLine: MultiLine;
  if (previousShape.type === 'multi-line') {
    newLine = MultiLine.addPoint(previousShape, {
      x: updatedEditor.cursorPosition.x,
      y: updatedEditor.cursorPosition.y,
    });
    updatedDocument = updateShapeInDocument(
      { ...args, document: updatedDocument, editor: updatedEditor },
      newLine,
    );
  } else {
    const previousPoint = getPreviousShapePoint(args, updatedEditor.previousShapeId);
    newLine = MultiLine.build({
      points: [previousPoint, updatedEditor.cursorPosition],
    });
    updatedDocument = addShapeToDocument(args, newLine);
  }
  updatedEditor = setPreviousShapeId(updatedEditor, newLine.id);
  return [updatedEditor, updatedDocument];
}

function linkPreviousShape(
  args: CommandArgs,
  newShape: Exclude<Shape, MultiLine | Point>,
): CommandResult {
  const { document, editor } = args;

  if (!editor.previousShapeId) {
    const updatedEditor = setPreviousShapeId(editor, newShape.id);
    return [updatedEditor, document];
  }

  const previousPoint = getPreviousShapePoint(args, editor.previousShapeId);
  const nextPoint = getNewShapePoint(args, newShape, previousPoint);

  const linkingLine = MultiLine.build({
    points: [previousPoint, nextPoint],
  });

  const updatedDocument = addShapeToDocument(args, linkingLine);
  const updatedEditor = setPreviousShapeId(editor, newShape.id);
  return [updatedEditor, updatedDocument];
}

function getPreviousShapePoint(
  args: CommandArgs,
  previousShapeId: ShapeId,
): AnchorPoint | Coordinate {
  const { document, editor, spatialIndex } = args;
  const previousShape = Document.getShapeById(document, previousShapeId);
  console.log(previousShape);
  if (!previousShape) {
    throw new Error(`Previous shape with ID ${editor.previousShapeId} not found`);
  }
  switch (previousShape.type) {
    case 'multi-line': {
      const points = resolveLinePoints(document, previousShape);
      if (points.length === 0) {
        throw new Error(`Previous multi-line shape with ID ${previousShape.id} has no points`);
      }
      return points[points.length - 1];
    }
    case 'point': {
      return previousShape;
    }
    default: {
      const point = spatialIndex.getNearestAnchorPoint(editor.cursorPosition, previousShapeId);
      if (!point) {
        throw new Error(`No anchor point found for shape with ID ${editor.previousShapeId}`);
      }
      return point;
    }
  }
}

function getNewShapePoint(
  args: CommandArgs,
  newShape: Exclude<Shape, MultiLine | Point>,
  previousPoint: Coordinate,
): Coordinate {
  const point = args.spatialIndex.getNearestAnchorPoint(previousPoint, newShape.id);
  if (!point) {
    throw new Error(`No anchor point found for new shape with ID ${newShape.id}`);
  }
  return point;
}
