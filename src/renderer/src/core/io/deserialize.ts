import {
  addShapesToDocument,
  createNewDocument,
  DocumentModel,
  updateDocumentMetadata,
} from '@renderer/core/document/Document';
import { createEditor, Editor, setCursorPosition } from '@renderer/core/editor/Editor';
import { Shape } from '@renderer/core/geometry/Shape';

import { FlowFile } from './FlowFile';

/* ---------- type guard ---------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function assertFlowFile(data: unknown): asserts data is FlowFile {
  if (!isRecord(data)) {
    throw new Error('Unsupported or invalid Flow file');
  }

  if (!('version' in data) || typeof data.version !== 'number' || data.version !== 1) {
    throw new Error('Unsupported or invalid Flow file');
  }

  if (!('shapes' in data) || !Array.isArray(data.shapes)) {
    throw new Error('Invalid shapes');
  }
}

/* ---------- deserialization ---------- */

export function deserializeFromJSONString(json: string): {
  document: DocumentModel;
  editor: Editor;
} {
  const parsed: unknown = JSON.parse(json);

  assertFlowFile(parsed);

  // Rebuild document
  let document = createNewDocument(parsed.metadata.name);

  document = updateDocumentMetadata(document, {
    path: parsed.metadata.path ?? null,
    isSaved: true,
    lastEdited: new Date(parsed.metadata.lastEditedISO),
  });

  document = addShapesToDocument(document, parsed.shapes as Shape[]);

  // Rebuild editor
  let editor = createEditor();
  if (parsed.editor?.cursorPosition) {
    editor = setCursorPosition(editor, parsed.editor.cursorPosition);
  }

  return { document, editor };
}
