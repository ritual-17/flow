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
import { setCursorPosition, setMode } from '@renderer/core/editor/Editor';

function enterNormalMode({ editor, document }: CommandArgs): CommandResult {
  return [setMode(editor, 'normal'), document];
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

function cursorUp({ editor, document }: CommandArgs): CommandResult {
  return [
    setCursorPosition(editor, {
      x: editor.cursorPosition.x,
      y: editor.cursorPosition.y - 1,
    }),
    document,
  ];
}

function cursorDown({ editor, document }: CommandArgs): CommandResult {
  return [
    setCursorPosition(editor, {
      x: editor.cursorPosition.x,
      y: editor.cursorPosition.y + 1,
    }),
    document,
  ];
}

function cursorLeft({ editor, document }: CommandArgs): CommandResult {
  return [
    setCursorPosition(editor, {
      x: editor.cursorPosition.x - 1,
      y: editor.cursorPosition.y,
    }),
    document,
  ];
}

function cursorRight({ editor, document }: CommandArgs): CommandResult {
  return [
    setCursorPosition(editor, {
      x: editor.cursorPosition.x + 1,
      y: editor.cursorPosition.y,
    }),
    document,
  ];
}

export {
  enterInsertMode,
  enterNormalMode,
  enterVisualMode,
  enterCommandMode,
  cursorUp,
  cursorDown,
  cursorLeft,
  cursorRight,
};
