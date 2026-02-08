import { CommandDispatcher } from '@renderer/core/commands/CommandDispatcher';
import { Document, DocumentModel } from '@renderer/core/document/Document';
import {
  createEditor,
  Editor,
  setCommandBuffer,
  setEditingTextBox,
} from '@renderer/core/editor/Editor';
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
  updateEditingTextBoxContent: (content: string) => void;
  saveFile: () => Promise<void>;
  openFile: () => Promise<void>;
}

export const useStore = create<DocumentStore>((set) => ({
  editor: createEditor(),
  document: Document.createNewDocument('Untitled'),
  commandDispatcher: new CommandDispatcher(set),
  update: (newEditor, newDocument) => set({ editor: newEditor, document: newDocument }),
  updateEditor: (newEditor) => set({ editor: newEditor }),
  updateDocument: (newDocument) => set({ document: newDocument }),
  updateCommandBuffer: (command: string) => {
    const editor = useStore.getState().editor;
    const commandEditor = setCommandBuffer(editor, command);

    const document = useStore.getState().document;
    const dispatcher = useStore.getState().commandDispatcher;

    dispatcher.dispatchCommand(commandEditor, document);
  },
  appendCommandBuffer: (char: string) => {
    const editor = useStore.getState().editor;
    const commandEditor = setCommandBuffer(editor, editor.commandBuffer + char);

    const document = useStore.getState().document;
    const dispatcher = useStore.getState().commandDispatcher;

    dispatcher.dispatchCommand(commandEditor, document);
  },
  updateEditingTextBoxContent: (content: string) => {
    const editor = useStore.getState().editor;
    const currentTextBox = editor.currentTextBox;
    if (!currentTextBox) {
      return;
    }
    const updatedEditor = setEditingTextBox(editor, {
      id: currentTextBox.id,
      content,
    });
    set({ editor: updatedEditor });
  },

  saveFile: async () => {
    const { document, editor } = useStore.getState();

    const contents = serializeToJSONString(document, editor);

    const result = await window.api.flowFS.save({
      contents,
      filePath: document.metadata.path,
    });

    if (!result.filePath) return; // user cancelled

    const updated = Document.updateDocumentMetadata(document, {
      path: result.filePath,
      isSaved: true,
      lastEdited: new Date(),
    });

    set({ document: updated });
  },

  openFile: async () => {
    const result = await window.api.flowFS.open();
    if (!result) return; // user cancelled

    const { document, editor } = deserializeFromJSONString(result.contents);

    const docWithPath = Document.updateDocumentMetadata(document, {
      path: result.filePath,
      isSaved: true,
      lastEdited: new Date(),
    });

    set({ document: docWithPath, editor });
  },
}));
