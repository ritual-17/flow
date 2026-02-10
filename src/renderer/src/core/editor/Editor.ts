import { Document, DocumentModel } from '@renderer/core/document/Document';
import { AnchorPoint, Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { produce } from 'immer';

export interface Editor {
  mode: Mode;
  selectedShapeIds: ShapeId[];
  cursorPosition: { x: number; y: number };
  commandBuffer: string;
  commandHistory: string[];
  clipboard: Shape[]; // stores copies of shapes relative to the center of the selection
  boxSelectAnchor?: { x: number; y: number };
  currentAnchorPoint: AnchorPoint | null;
  currentLineId: ShapeId | null;
  statusMessage: string;
  currentTextBox: TextBoxEditingState | null;
}

export interface TextBoxEditingState {
  id: ShapeId;
  content: string;
}

export type Mode = 'insert' | 'normal' | 'visual' | 'command' | 'text' | 'line' | 'anchor-line';

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
    currentAnchorPoint: null,
    currentLineId: null,
    boxSelectAnchor: undefined,
    statusMessage: '',
    currentTextBox: null,
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

function setCurrentAnchorPoint(editor: Editor, anchorPoint: AnchorPoint | null): Editor {
  return produce(editor, (draft) => {
    draft.currentAnchorPoint = anchorPoint;
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
  setCurrentAnchorPoint,
  setCurrentLineId,
  setBoxSelectAnchor,
  clearBoxSelectAnchor,
  setStatus,
  setCurrentTextBox,
};
