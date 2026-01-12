import { createNewDocument } from '@renderer/core/document/Document';
import { createEditor } from '@renderer/core/editor/Editor';
import { create } from 'zustand';

export interface DocumentStore {
  editor: ReturnType<typeof createEditor>;
  document: ReturnType<typeof createNewDocument>;
  update: (
    newEditor: ReturnType<typeof createEditor>,
    newDocument: ReturnType<typeof createNewDocument>,
  ) => void;
  updateEditor: (newEditor: ReturnType<typeof createEditor>) => void;
  updateDocument: (newDocument: ReturnType<typeof createNewDocument>) => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  editor: createEditor(),
  document: createNewDocument('Untitled'),
  update: (newEditor, newDocument) => set({ editor: newEditor, document: newDocument }),
  updateEditor: (newEditor) => set({ editor: newEditor }),
  updateDocument: (newDocument) => set({ document: newDocument }),
}));
