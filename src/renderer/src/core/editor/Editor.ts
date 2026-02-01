import { DocumentModel } from '@renderer/core/document/Document';
import { Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { produce } from 'immer';

export interface Editor {
  mode: Mode;
  selectedShapeIds: ShapeId[];
  cursorPosition: { x: number; y: number };
  commandBuffer: string;
  commandHistory: string[];
  clipboard: Shape[]; // stores copies of shapes relative to the center of the selection
  visualAnchor?: { x: number; y: number };
}

export type Mode = 'insert' | 'normal' | 'visual' | 'command' | 'text';

function createEditor(): Editor {
  return {
    mode: 'normal',
    selectedShapeIds: [],
    cursorPosition: { x: 0, y: 0 },
    commandBuffer: '',
    commandHistory: [],
    clipboard: [],
    visualAnchor: undefined,
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

function getSelectedShapes(editor: Editor, document: DocumentModel): Shape[] {
  return editor.selectedShapeIds
    .map((id) => document.shapes.get(id))
    .filter((shape): shape is Shape => shape !== undefined);
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

// Functions for visual mode operations

function setVisualAnchor(editor: Editor, position: { x: number; y: number }): Editor {
  return produce(editor, (draft) => {
    draft.visualAnchor = position;
  });
}

function clearVisualAnchor(editor: Editor): Editor {
  return produce(editor, (draft) => {
    draft.visualAnchor = undefined;
  });
}

export {
  createEditor,
  setMode,
  setSelectedShapes,
  getSelectedShapes,
  clearSelection,
  addToSelection,
  removeFromSelection,
  toggleSelection,
  setCursorPosition,
  setCommandBuffer,
  addToCommandHistory,
  setClipboard,
  setVisualAnchor,
  clearVisualAnchor,
};
