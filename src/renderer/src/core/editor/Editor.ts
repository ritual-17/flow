import { Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { produce } from 'immer';

export interface Editor {
  mode: Mode;
  selectedShapeIds: ShapeId[];
  cursorPosition: { x: number; y: number };
  commandBuffer: string;
  commandHistory: string[];
  clipboard: Shape[];
}

export type Mode = 'insert' | 'normal' | 'visual' | 'command';

function updateEditorMode(editor: Editor, mode: Mode): Editor {
  return produce(editor, (draft) => {
    draft.mode = mode;
  });
}

function selectShapes(editor: Editor, shapeIds: ShapeId[]): Editor {
  return produce(editor, (draft) => {
    draft.selectedShapeIds = shapeIds;
  });
}

function updateCursorPosition(editor: Editor, position: { x: number; y: number }): Editor {
  return produce(editor, (draft) => {
    draft.cursorPosition = position;
  });
}

function updateCommandBuffer(editor: Editor, command: string): Editor {
  return produce(editor, (draft) => {
    draft.commandBuffer = command;
  });
}

function addToCommandHistory(editor: Editor, command: string): Editor {
  return produce(editor, (draft) => {
    draft.commandHistory.push(command);
  });
}

function updateClipboard(editor: Editor, shapes: Shape[]): Editor {
  return produce(editor, (draft) => {
    draft.clipboard = shapes;
  });
}

export {
  updateEditorMode,
  selectShapes,
  updateCursorPosition,
  updateCommandBuffer,
  addToCommandHistory,
  updateClipboard,
};
