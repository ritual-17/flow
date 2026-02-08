import { CommandDispatcher } from '@renderer/core/commands/CommandDispatcher';
import {
  createNewDocument,
  DocumentModel,
  updateDocumentMetadata,
} from '@renderer/core/document/Document';
import { createEditor, Editor, setCommandBuffer } from '@renderer/core/editor/Editor';
import { deserializeFromJSONString } from '@renderer/core/io/Deserialize';
import { serializeToJSONString } from '@renderer/core/io/Serialize';
import { create } from 'zustand';

export interface DocumentStore {
  editor: Editor;
  document: DocumentModel;
  commandDispatcher: CommandDispatcher;
  update: (newEditor: Editor, newDocument: DocumentModel) => void;
  updateEditor: (newEditor: Editor) => void;
  updateDocument: (newDocument: DocumentModel) => void;
  updateCommandBuffer: (command: string) => void;
  appendCommandBuffer: (char: string) => void;
  saveFile: () => Promise<void>;
  openFile: () => Promise<void>;
}

export const useStore = create<DocumentStore>((set) => ({
  editor: createEditor(),
  document: createNewDocument('Untitled'),
  commandDispatcher: new CommandDispatcher(),
  update: (newEditor, newDocument) => set({ editor: newEditor, document: newDocument }),
  updateEditor: (newEditor) => set({ editor: newEditor }),
  updateDocument: (newDocument) => set({ document: newDocument }),
  updateCommandBuffer: (command: string) => {
    const editor = useStore.getState().editor;
    const commandEditor = setCommandBuffer(editor, command);

    const document = useStore.getState().document;
    const dispatcher = useStore.getState().commandDispatcher;

    const [newEditor, newDocument] = dispatcher.dispatchCommand(commandEditor, document);
    set({ editor: newEditor, document: newDocument });
  },
  appendCommandBuffer: (char: string) => {
    const editor = useStore.getState().editor;
    const commandEditor = setCommandBuffer(editor, editor.commandBuffer + char);

    const document = useStore.getState().document;
    const dispatcher = useStore.getState().commandDispatcher;

    const [newEditor, newDocument] = dispatcher.dispatchCommand(commandEditor, document);
    set({ editor: newEditor, document: newDocument });
  },

  saveFile: async () => {
    const { document, editor } = useStore.getState();

    const contents = serializeToJSONString(document, editor);

    const result = await window.api.flowFS.save({
      contents,
      filePath: document.metadata.path,
    });

    if (!result.filePath) return; // user cancelled

    const updatedDocument = updateDocumentMetadata(document, {
      path: result.filePath,
      isSaved: true,
      lastEdited: new Date(),
    });

    const clearedEditor = setCommandBuffer(editor, '');

    set({
      document: updatedDocument,
      editor: clearedEditor,
    });
  },

  openFile: async () => {
    const result = await window.api.flowFS.open();
    if (!result) return; // user cancelled

    const { document, editor } = deserializeFromJSONString(result.contents);

    const updatedDocument = updateDocumentMetadata(document, {
      path: result.filePath,
      isSaved: true,
      lastEdited: new Date(),
    });

    const clearedEditor = setCommandBuffer(editor, '');

    set({
      document: updatedDocument,
      editor: clearedEditor,
    });
  },
}));
