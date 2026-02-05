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
import { previousModeExitCleanup } from '@renderer/core/commands/modes/onExit';
import {
  clearBoxSelectAnchor,
  clearSelection,
  setCurrentAnchorPoint,
  setCursorPosition,
  setEditingTextBoxId,
  setMode,
  setSelectedShapes,
} from '@renderer/core/editor/Editor';

const CURSOR_MOVE_AMOUNT = 10;

function enterNormalMode(args: CommandArgs): CommandResult {
  // disabling because it is complaining updatedDocument is not reassigned
  // eslint-disable-next-line prefer-const
  let [updatedEditor, updatedDocument] = previousModeExitCleanup(args);
  updatedEditor = setSelectedShapes(updatedEditor, []);
  updatedEditor = clearBoxSelectAnchor(updatedEditor);
  updatedEditor = setMode(updatedEditor, 'normal');

  return [updatedEditor, updatedDocument];
}

function enterInsertMode(args: CommandArgs): CommandResult {
  const [updatedEditor, updatedDocument] = previousModeExitCleanup(args);
  return [setMode(updatedEditor, 'insert'), updatedDocument];
}

function enterVisualMode(args: CommandArgs): CommandResult {
  // disabling because it is complaining updatedDocument is not reassigned
  // eslint-disable-next-line prefer-const
  let [updatedEditor, updatedDocument] = previousModeExitCleanup(args);
  updatedEditor = setMode(updatedEditor, 'visual');
  updatedEditor = clearSelection(updatedEditor);
  return [updatedEditor, updatedDocument];
}

function enterCommandMode(args: CommandArgs): CommandResult {
  const [updatedEditor, updatedDocument] = previousModeExitCleanup(args);
  return [setMode(updatedEditor, 'command'), updatedDocument];
}

function enterLineMode(args: CommandArgs): CommandResult {
  const [updatedEditor, updatedDocument] = previousModeExitCleanup(args);
  return [setMode(updatedEditor, 'line'), updatedDocument];
}

function enterTextMode(args: CommandArgs): CommandResult {
  const { spatialIndex } = args;
  // disabling because it is complaining updatedDocument is not reassigned
  // eslint-disable-next-line prefer-const
  let [updatedEditor, updatedDocument] = previousModeExitCleanup(args);

  const nearestTextBox = spatialIndex.getNearestTextBox(updatedEditor.cursorPosition);
  if (nearestTextBox) {
    updatedEditor = setMode(updatedEditor, 'text');
    updatedEditor = setCursorPosition(updatedEditor, { x: nearestTextBox.x, y: nearestTextBox.y });
    updatedEditor = setEditingTextBoxId(updatedEditor, nearestTextBox.id);
    return [updatedEditor, updatedDocument];
  }

  // no text box exists so reject the command. should probably add an error message later
  return [updatedEditor, updatedDocument];
}

function enterAnchorLineMode(args: CommandArgs): CommandResult {
  const { spatialIndex } = args;
  // disabling because it is complaining updatedDocument is not reassigned
  // eslint-disable-next-line prefer-const
  let [updatedEditor, updatedDocument] = previousModeExitCleanup(args);
  const nearestAnchorPoint = spatialIndex.getNearestAnchorPoint(updatedEditor.cursorPosition);

  // if there is an anchor point nearby, snap to it, otherwise just enter line mode starting at the cursor
  if (nearestAnchorPoint) {
    updatedEditor = setCursorPosition(updatedEditor, nearestAnchorPoint);
    updatedEditor = setCurrentAnchorPoint(updatedEditor, nearestAnchorPoint);
    return [setMode(updatedEditor, 'anchor-line'), updatedDocument];
  }

  return [setMode(updatedEditor, 'line'), updatedDocument];
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
  enterTextMode,
  cursorUp,
  cursorDown,
  cursorLeft,
  cursorRight,
  selectNextSearchResult,
};
