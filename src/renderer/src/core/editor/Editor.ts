import { AnchorPoint, Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { produce } from 'immer';

export interface Editor {
  mode: Mode;
  selectedShapeIds: ShapeId[];
  cursorPosition: { x: number; y: number };
  commandBuffer: string;
  commandHistory: string[];
  clipboard: Shape[];
  currentAnchorPoint: AnchorPoint | null;
  currentLineId: ShapeId | null;
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
  };
}

function setMode(editor: Editor, mode: Mode): Editor {
  return produce(editor, (draft) => {
    draft.mode = mode;
  });
}

function setSelectedShapes(editor: Editor, shapeIds: ShapeId[]): Editor {
  return produce(editor, (draft) => {
    draft.selectedShapeIds = shapeIds;
  });
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

export {
  createEditor,
  setMode,
  setSelectedShapes,
  setCursorPosition,
  setCommandBuffer,
  addToCommandHistory,
  setClipboard,
  setCurrentAnchorPoint,
  setCurrentLineId,
};
