import { Document, DocumentModel } from '@renderer/core/document/Document';
import { AnchorRef, Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { useStore } from '@renderer/ui/Store';
import { produce } from 'immer';

export interface Editor {
  mode: Mode;
  selectedShapeIds: ShapeId[];
  cursorPosition: { x: number; y: number };
  commandBuffer: string;
  commandHistory: string[];
  clipboard: Shape[]; // stores copies of shapes relative to the center of the selection
  boxSelectAnchor?: { x: number; y: number };
  currentAnchorRef: AnchorRef | null;
  currentLineId: ShapeId | null;
  previousShapeId: ShapeId | null; // for auto-linking, to keep track of the last shape that was linked from
  statusMessage: string;
  currentTextBox: TextBoxEditingState | null;
  helpMenuOpen: boolean;
}

export interface TextBoxEditingState {
  id: ShapeId;
  content: string;
}

export type Mode =
  | 'insert'
  | 'normal'
  | 'visual'
  | 'visual-block'
  | 'command'
  | 'text'
  | 'line'
  | 'anchor-line'
  | 'auto-link-insert';

// any modification to the editor state should go through these functions
// below are just some helper functions to create and update the editor state
function createEditor(): Editor {
  return {
    mode: 'normal',
    selectedShapeIds: [],
    cursorPosition: { x: 0, y: 0 },
    commandBuffer: '',
    commandHistory: [],
    clipboard: [],
    currentAnchorRef: null,
    currentLineId: null,
    previousShapeId: null,
    boxSelectAnchor: undefined,
    statusMessage: '',
    currentTextBox: null,
    helpMenuOpen: false,
  };
}

function setMode(editor: Editor, mode: Mode): Editor {
  return produce(editor, (draft) => {
    draft.mode = mode;
  });
}

// Editor state shape manipulation functions to be used by visual commands

function setSelectedShapes(editor: Editor, shapeIds: ShapeId[]): Editor {
  return produce(editor, (draft) => {
    draft.selectedShapeIds = shapeIds;
  });
}

function pushSelectedShapes(editor: Editor, shapeIds: ShapeId[]): Editor {
  return produce(editor, (draft) => {
    draft.selectedShapeIds.push(...shapeIds);
  });
}

function getSelectedShapes(editor: Editor, document: DocumentModel): Shape[] {
  return editor.selectedShapeIds.map((id) => Document.getShapeById(document, id));
}

function clearSelection(editor: Editor): Editor {
  return produce(editor, (draft) => {
    draft.selectedShapeIds = [];
  });
}

function addToSelection(editor: Editor, shapeId: ShapeId): Editor {
  return produce(editor, (draft) => {
    if (!draft.selectedShapeIds.includes(shapeId)) {
      draft.selectedShapeIds.push(shapeId);
    }
  });
}

function removeFromSelection(editor: Editor, shapeId: ShapeId): Editor {
  return produce(editor, (draft) => {
    draft.selectedShapeIds = draft.selectedShapeIds.filter((id) => id !== shapeId);
  });
}

function toggleSelection(editor: Editor, shapeId: ShapeId): Editor {
  if (editor.selectedShapeIds.includes(shapeId)) {
    return removeFromSelection(editor, shapeId);
  }
  return addToSelection(editor, shapeId);
}

function setCursorPosition(editor: Editor, position: { x: number; y: number }): Editor {
  return produce(editor, (draft) => {
    draft.cursorPosition = position;
  });
}

function setCommandBuffer(editor: Editor, command: string): Editor {
  return produce(editor, (draft) => {
    draft.commandBuffer = command;
  });
}

function addToCommandHistory(editor: Editor, command: string): Editor {
  return produce(editor, (draft) => {
    draft.commandHistory.push(command);
  });
}

function setClipboard(editor: Editor, shapes: Shape[]): Editor {
  return produce(editor, (draft) => {
    draft.clipboard = shapes;
  });
}

function setCurrentAnchorRef(editor: Editor, anchorRef: AnchorRef | null): Editor {
  return produce(editor, (draft) => {
    draft.currentAnchorRef = anchorRef;
  });
}

function setCurrentLineId(editor: Editor, lineId: ShapeId | null): Editor {
  return produce(editor, (draft) => {
    draft.currentLineId = lineId;
  });
}

function setCurrentTextBox(editor: Editor, textBoxState: TextBoxEditingState | null): Editor {
  return produce(editor, (draft) => {
    draft.currentTextBox = textBoxState;
  });
}

// Functions for visual mode operations

function setBoxSelectAnchor(editor: Editor, position: { x: number; y: number }): Editor {
  return produce(editor, (draft) => {
    draft.boxSelectAnchor = position;
  });
}

function clearBoxSelectAnchor(editor: Editor): Editor {
  return produce(editor, (draft) => {
    draft.boxSelectAnchor = undefined;
  });
}

function setStatus(editor: Editor, message: string): Editor {
  return produce(editor, (draft) => {
    draft.statusMessage = message;
  });
}

function setPreviousShapeId(editor: Editor, shapeId: ShapeId | null): Editor {
  return produce(editor, (draft) => {
    draft.previousShapeId = shapeId;
  });
}

function helperPanViewportForItem(
  lastMovement: 'up' | 'down' | 'left' | 'right' | 'shape',
  editor: Editor,
  shapes: Shape[] = [],
): void {
  const { viewport } = useStore.getState();
  const cursor = editor.cursorPosition;
  const panAmount = 50;
  if (!cursor) return;

  const buffer = 50; // buffer in pixels to trigger viewport scroll before cursor goes out of view

  let anchorItemX = cursor.x,
    anchorItemY = cursor.y;
  // shapes are being translated
  if (shapes.length) {
    anchorItemX =
      lastMovement === 'left'
        ? Math.min(...shapes.map((s) => s.x))
        : Math.max(...shapes.map((s) => s.x));
    anchorItemY =
      lastMovement === 'up'
        ? Math.min(...shapes.map((s) => s.y))
        : Math.max(...shapes.map((s) => s.y));
  }
  const { pan } = useStore.getState();
  if (lastMovement === 'up' && anchorItemY < -viewport.y + buffer) {
    pan(0, panAmount);
  } else if (lastMovement === 'down' && anchorItemY > -viewport.y + window.innerHeight - buffer) {
    pan(0, -panAmount);
  } else if (lastMovement === 'left' && anchorItemX < -viewport.x + buffer) {
    pan(panAmount, 0);
  } else if (lastMovement === 'right' && anchorItemX > -viewport.x + window.innerWidth - buffer) {
    pan(-panAmount, 0);
  } else if (
    lastMovement === 'shape' &&
    (anchorItemY < -viewport.y + buffer ||
      anchorItemY > -viewport.y + window.innerHeight - buffer ||
      anchorItemX < -viewport.x + buffer ||
      anchorItemX > -viewport.x + window.innerWidth - buffer)
  ) {
    const { centerViewportOn } = useStore.getState();

    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight - 24; // status bar

    centerViewportOn(anchorItemX, anchorItemY, canvasWidth, canvasHeight);
  }

  return;
}

function helperKeepCursorInViewport(
  lastMovement: 'up' | 'down' | 'left' | 'right' | 'shape',
  editor: Editor,
) {
  const cursor = editor.cursorPosition;
  const cursorMoveAmount = 50,
    buffer = 50;
  const { viewport } = useStore.getState();
  let updatedEditor = editor;

  if (lastMovement === 'up' && cursor.y > -viewport.y + window.innerHeight - buffer) {
    updatedEditor = setCursorPosition(editor, { x: cursor.x, y: cursor.y - cursorMoveAmount });
  } else if (lastMovement === 'down' && cursor.y < -viewport.y + buffer) {
    updatedEditor = setCursorPosition(editor, { x: cursor.x, y: cursor.y + cursorMoveAmount });
  } else if (lastMovement === 'left' && cursor.x > -viewport.x + window.innerWidth - buffer) {
    updatedEditor = setCursorPosition(editor, { x: cursor.x - cursorMoveAmount, y: cursor.y });
  } else if (lastMovement === 'right' && cursor.x < -viewport.x + buffer) {
    updatedEditor = setCursorPosition(editor, { x: cursor.x + cursorMoveAmount, y: cursor.y });
  }
  return updatedEditor;
}

function toggleHelpMenu(editor: Editor): Editor {
  return produce(editor, (draft) => {
    draft.helpMenuOpen = !editor.helpMenuOpen;
  });
}

export {
  createEditor,
  setMode,
  setSelectedShapes,
  pushSelectedShapes,
  getSelectedShapes,
  clearSelection,
  addToSelection,
  removeFromSelection,
  toggleSelection,
  setCursorPosition,
  setCommandBuffer,
  addToCommandHistory,
  setClipboard,
  setCurrentAnchorRef,
  setCurrentLineId,
  setBoxSelectAnchor,
  clearBoxSelectAnchor,
  setStatus,
  setCurrentTextBox,
  setPreviousShapeId,
  helperPanViewportForItem,
  helperKeepCursorInViewport,
  toggleHelpMenu,
};
