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
  setEditingTextBox,
  setMode,
  setSelectedShapes,
} from '@renderer/core/editor/Editor';

const CURSOR_MOVE_AMOUNT = 10;

async function enterNormalMode(args: CommandArgs): Promise<CommandResult> {
  // disabling because it is complaining updatedDocument is not reassigned
  // eslint-disable-next-line prefer-const
  let [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);

  updatedEditor = setSelectedShapes(updatedEditor, []);
  updatedEditor = clearBoxSelectAnchor(updatedEditor);
  updatedEditor = setMode(updatedEditor, 'normal');

  return [updatedEditor, updatedDocument];
}

async function enterInsertMode(args: CommandArgs): Promise<CommandResult> {
  const [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);
  return [setMode(updatedEditor, 'insert'), updatedDocument];
}

async function enterVisualMode(args: CommandArgs): Promise<CommandResult> {
  // disabling because it is complaining updatedDocument is not reassigned
  // eslint-disable-next-line prefer-const
  let [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);
  updatedEditor = setMode(updatedEditor, 'visual');
  updatedEditor = clearSelection(updatedEditor);
  return [updatedEditor, updatedDocument];
}

async function enterCommandMode(args: CommandArgs): Promise<CommandResult> {
  const [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);
  return [setMode(updatedEditor, 'command'), updatedDocument];
}

async function enterLineMode(args: CommandArgs): Promise<CommandResult> {
  const [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);
  return [setMode(updatedEditor, 'line'), updatedDocument];
}

async function enterTextMode(args: CommandArgs): Promise<CommandResult> {
  const { spatialIndex } = args;
  // disabling because it is complaining updatedDocument is not reassigned
  // eslint-disable-next-line prefer-const
  let [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);

  const nearestTextBox = spatialIndex.getNearestTextBox(updatedEditor.cursorPosition);
  if (nearestTextBox) {
    updatedEditor = setMode(updatedEditor, 'text');
    updatedEditor = setCursorPosition(updatedEditor, { x: nearestTextBox.x, y: nearestTextBox.y });
    updatedEditor = setEditingTextBox(updatedEditor, {
      id: nearestTextBox.id,
      content: nearestTextBox.text,
    });
    return [updatedEditor, updatedDocument];
  }

  // no text box exists so reject the command. should probably add an error message later
  return [updatedEditor, updatedDocument];
}

async function enterAnchorLineMode(args: CommandArgs): Promise<CommandResult> {
  const { spatialIndex } = args;
  // disabling because it is complaining updatedDocument is not reassigned
  // eslint-disable-next-line prefer-const
  let [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);
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

// functions to handle undo and redo commands. these will be passed as callbacks to the
// CommandRegistry for the undo and redo commands respectively
// export function undo(editor: Editor, document: DocumentModel): void {
//   if (!this.history.canUndo()) return;

//   const prevDocument = this.history.undo(document);
//   this.callback({ editor, document: prevDocument });
// }

// export function public redo(editor: Editor, document: DocumentModel): void {
//   if (!this.history.canRedo()) return;

//   const nextDocument = this.history.redo(document);
//   this.callback({ editor, document: nextDocument });
// }

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
