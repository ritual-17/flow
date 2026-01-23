// Handles manipulation commands i.e. commands for manipulating shapes and updating the document accordingly

import { CommandArgs } from '@renderer/core/commands/CommandRegistry';
import { addShapesToDocument, DocumentModel } from '@renderer/core/document/Document';
import { Editor } from '@renderer/core/editor/Editor';
import { Shape } from '@renderer/core/geometry/Shape';
import * as Circle from '@renderer/core/geometry/shapes/Circle';

function addShapeToDocument({
  editor,
  document,
  spatialIndex,
  args,
}: CommandArgs): [Editor, DocumentModel] {
  // is there a way to type check this better?
  const shape = args.shape as Shape;

  const newDocument = addShapesToDocument(document, [shape]);
  spatialIndex.addShape(shape);
  return [editor, newDocument];
}

function createCircle(args: CommandArgs): [Editor, DocumentModel] {
  const { x, y } = args.editor.cursorPosition;
  const circle = Circle.build({ x, y });

  return addShapeToDocument({
    ...args,
    args: { shape: circle },
  });
}

export { addShapeToDocument, createCircle };
