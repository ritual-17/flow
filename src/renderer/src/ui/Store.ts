import { CommandDispatcher } from '@renderer/core/commands/CommandDispatcher';
import { Document, DocumentModel } from '@renderer/core/document/Document';
import {
  createEditor,
  Editor,
  setCommandBuffer,
  setCurrentTextBox,
} from '@renderer/core/editor/Editor';
import { create } from 'zustand';

type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

const initialViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

export interface DocumentStore {
  editor: Editor;
  document: DocumentModel;
  commandDispatcher: CommandDispatcher;
  viewport: Viewport;
  setViewport: (vp: Partial<Viewport>) => void;
  pan: (dx: number, dy: number) => void;
  update: (newEditor: Editor, newDocument: DocumentModel) => void;
  updateEditor: (newEditor: Editor) => void;
  updateDocument: (newDocument: DocumentModel) => void;
  updateCommandBuffer: (command: string) => void;
  appendCommandBuffer: (char: string) => void;
  updateCurrentTextBoxContent: (content: string) => void;
}

export const useStore = create<DocumentStore>((set) => ({
  editor: createEditor(),
  document: Document.createNewDocument('Untitled'),
  commandDispatcher: new CommandDispatcher(set),
  viewport: initialViewport,
  setViewport: (vp: Partial<Viewport>) =>
    set((state) => ({ viewport: { ...state.viewport, ...vp } })),
  pan: (dx: number, dy: number) =>
    set((state) => ({
      viewport: { ...state.viewport, x: state.viewport.x + dx, y: state.viewport.y + dy },
    })),
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
  updateCurrentTextBoxContent: (content: string) => {
    const editor = useStore.getState().editor;
    const currentTextBox = editor.currentTextBox;
    if (!currentTextBox) {
      return;
    }
    const updatedEditor = setCurrentTextBox(editor, {
      id: currentTextBox.id,
      content,
    });
    set({ editor: updatedEditor });
  },
}));
