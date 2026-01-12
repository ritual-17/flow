// Handles manipulation commands i.e. commands for manipulating shapes and updating the document accordingly

import { addShapesToDocument, DocumentModel } from '@renderer/core/document/Document';
import { Editor } from '@renderer/core/editor/Editor';
import { Shape } from '@renderer/core/geometry/Shape';
import { SpatialIndex } from '@renderer/core/geometry/SpatialIndex';

function addShapeToDocument(
  editor: Editor,
  document: DocumentModel,
  spatialIndex: SpatialIndex,
  shape: Shape,
): [Editor, DocumentModel] {
  const newDocument = addShapesToDocument(document, [shape]);
  spatialIndex.addShape(shape);
  return [editor, newDocument];
}

export { addShapeToDocument };
