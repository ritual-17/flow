import { CommandDispatcher } from '@renderer/core/commands/CommandDispatcher';
import { Document, DocumentModel } from '@renderer/core/document/Document';
import {
  createEditor,
  Editor,
  setCommandBuffer,
  setEditingTextBox,
} from '@renderer/core/editor/Editor';
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
}));
