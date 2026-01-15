// Handles manipulation commands i.e. commands for manipulating shapes and updating the document accordingly

import { CommandArgs } from '@renderer/core/commands/CommandRegistry';
import { addShapesToDocument, DocumentModel } from '@renderer/core/document/Document';
import { Editor } from '@renderer/core/editor/Editor';
import { Circle, Shape } from '@renderer/core/geometry/Shape';

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
  const circle: Circle = {
    type: 'circle',
    id: `circle-${Date.now()}`,
    x: x,
    y: y,
    radius: 50,
    zIndex: 1,
    stroke: 2,
    fill: 3,
    strokeColor: 'black',
    fillColor: 'red',
  };

  return addShapeToDocument({
    ...args,
    args: { shape: circle },
  });
}

export { addShapeToDocument, createCircle };
