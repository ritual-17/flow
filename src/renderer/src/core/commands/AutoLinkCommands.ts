import { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import { addShapeToDocument } from '@renderer/core/commands/ManipulationCommands';
import { Shape } from '@renderer/core/geometry/Shape';
import { Circle } from '@renderer/core/geometry/shapes/Circle';

export function autoLinkCircle(args: CommandArgs): CommandResult {
  const { x, y } = args.editor.cursorPosition;
  const circle = Circle.build({ x, y });

  const updatedDocument = addShapeToDocument(args, circle);

  return [args.editor, updatedDocument];
}

function createLinkingLine(args: CommandArgs, newShape: Shape) {
  switch (newShape.type) {
    case 'multi-line': {
      return addToLine();
    }
    default: {
      return linkPreviousShape(args, newShape);
    }
  }
}

function addToLine() {}

function linkPreviousShape(args: CommandArgs, newShape: Shape): CommandResult {
  const { document, editor } = args;
  if (!editor.previousShapeId) {
    return [editor, document];
  }
  const previousShape = document.shapes[editor.previousShapeId];
  if (!previousShape) {
    throw new Error(`Previous shape with ID ${editor.previousShapeId} not found`);
  }
}
