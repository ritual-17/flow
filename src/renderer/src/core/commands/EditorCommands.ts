/**
Handles editor commands.

These are commands that change the state of the editor, but do not
impact the state of the document.

-- Examples
* Side effects: write, quit, etc
* Mode changes: Normal -> Visual mode
* Moving the cursor
**/

import { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import {
  setCurrentAnchorPoint,
  setCursorPosition,
  setMode,
  setSelectedShapes,
} from '@renderer/core/editor/Editor';

const CURSOR_MOVE_AMOUNT = 10;

function enterNormalMode({ editor, document }: CommandArgs): CommandResult {
  let updatedEditor = setSelectedShapes(editor, []);
  updatedEditor = setMode(updatedEditor, 'normal');

  return [updatedEditor, document];
}

function enterInsertMode({ editor, document }: CommandArgs): CommandResult {
  return [setMode(editor, 'insert'), document];
}

function enterVisualMode({ editor, document }: CommandArgs): CommandResult {
  return [setMode(editor, 'visual'), document];
}

function enterCommandMode({ editor, document }: CommandArgs): CommandResult {
  return [setMode(editor, 'command'), document];
}

function enterLineMode({ editor, document }: CommandArgs): CommandResult {
  return [setMode(editor, 'line'), document];
}

function enterAnchorLineMode({ editor, document, spatialIndex }: CommandArgs): CommandResult {
  const nearestAnchorPoint = spatialIndex.getNearestAnchorPoint(editor.cursorPosition);

  // if there is an anchor point nearby, snap to it, otherwise just enter line mode starting at the cursor
  if (nearestAnchorPoint) {
    let updatedEditor = setCursorPosition(editor, nearestAnchorPoint);
    updatedEditor = setCurrentAnchorPoint(updatedEditor, nearestAnchorPoint);
    return [setMode(updatedEditor, 'anchor-line'), document];
  }

  return [setMode(editor, 'line'), document];
}

function cursorUp({ editor, document }: CommandArgs): CommandResult {
  return [
    setCursorPosition(editor, {
      x: editor.cursorPosition.x,
      y: editor.cursorPosition.y + CURSOR_MOVE_AMOUNT,
    }),
    document,
  ];
}

function cursorDown({ editor, document }: CommandArgs): CommandResult {
  return [
    setCursorPosition(editor, {
      x: editor.cursorPosition.x,
      y: editor.cursorPosition.y - CURSOR_MOVE_AMOUNT,
    }),
    document,
  ];
}

function cursorLeft({ editor, document }: CommandArgs): CommandResult {
  return [
    setCursorPosition(editor, {
      x: editor.cursorPosition.x - CURSOR_MOVE_AMOUNT,
      y: editor.cursorPosition.y,
    }),
    document,
  ];
}

function cursorRight({ editor, document }: CommandArgs): CommandResult {
  return [
    setCursorPosition(editor, {
      x: editor.cursorPosition.x + CURSOR_MOVE_AMOUNT,
      y: editor.cursorPosition.y,
    }),
    document,
  ];
}

// update this later to use search results and if there is no current search then selected closest shape
function selectNextSearchResult({ editor, document, spatialIndex }: CommandArgs): CommandResult {
  const nearestShapeId = spatialIndex.getNearestShapeId(editor.cursorPosition);
  let updatedEditor = editor;
  if (nearestShapeId) {
    updatedEditor = setSelectedShapes(editor, [nearestShapeId]);

    const nearestShape = document.shapes.get(nearestShapeId);
    if (!nearestShape) {
      return [updatedEditor, document];
    }
    updatedEditor = setCursorPosition(updatedEditor, { x: nearestShape.x, y: nearestShape.y });
    updatedEditor = setMode(updatedEditor, 'visual');
  }
  return [updatedEditor, document];
}

export {
  enterInsertMode,
  enterNormalMode,
  enterVisualMode,
  enterCommandMode,
  enterLineMode,
  enterAnchorLineMode,
  cursorUp,
  cursorDown,
  cursorLeft,
  cursorRight,
  selectNextSearchResult,
};
