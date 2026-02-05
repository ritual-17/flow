import { DocumentModel } from '@renderer/core/document/Document';
import { Editor } from '@renderer/core/editor/Editor';

import { FlowFileV1 } from './flowfile';

export function serializeToFlowFileV1(document: DocumentModel, editor?: Editor): FlowFileV1 {
  return {
    version: 1,
    metadata: {
      name: document.metadata.name,
      lastEditedISO: document.metadata.lastEdited.toISOString(),
      path: document.metadata.path,
    },
    shapes: Array.from(document.shapes.values()),
    editor: editor
      ? {
          cursorPosition: editor.cursorPosition,
        }
      : undefined,
  };
}

export function serializeToJSONString(document: DocumentModel, editor?: Editor): string {
  return JSON.stringify(serializeToFlowFileV1(document, editor), null, 2);
}
