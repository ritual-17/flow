// Handles visual commands i.e. commands that do not manipulate shapes, but involve some visual change.
//
// e.g. select the closest shape, select the shapes in this region
//
// determine if this makes more sense to be handled here or in the renderer layer, since technically this is tightly coupled to rendering and not the documents.
// VisualCommands should operate on editor state, related to selection and visual modes

import { DocumentModel } from '@renderer/core/document/Document';
import { Editor } from '@renderer/core/editor/Editor';
import { produce } from 'immer';

function yankSelectedShapes(editor: Editor, document: DocumentModel): Editor {
  const selectedShapes = editor.selectedShapeIds
    .map((id) => document.shapes.get(id))
    .filter((shape) => shape !== undefined);

  return produce(editor, (draft) => {
    draft.clipboard = selectedShapes;
  });
}

export { yankSelectedShapes };
