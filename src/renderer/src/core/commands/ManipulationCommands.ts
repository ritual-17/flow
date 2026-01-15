// Handles manipulation commands i.e. commands for manipulating shapes and updating the document accordingly

import { CommandArgs } from '@renderer/core/commands/CommandRegistry';
import { addShapesToDocument, DocumentModel } from '@renderer/core/document/Document';
import { Editor } from '@renderer/core/editor/Editor';
import { Shape } from '@renderer/core/geometry/Shape';

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

export { addShapeToDocument };
