/**
Handles editor commands.

These are commands that change the state of the editor, but do not
impact the state of the document.

-- Examples
* Side effects: write, quit, etc
* Mode changes: Normal -> Visual mode
* Moving the cursor
**/

import { Editor, updateEditorMode } from '@renderer/core/editor/Editor';

function enterNormalMode(editor: Editor): Editor {
  return updateEditorMode(editor, 'normal');
}

function enterInsertMode(editor: Editor): Editor {
  return updateEditorMode(editor, 'insert');
}

function enterVisualMode(editor: Editor): Editor {
  return updateEditorMode(editor, 'visual');
}

function enterCommandMode(editor: Editor): Editor {
  return updateEditorMode(editor, 'command');
}

export { enterInsertMode, enterNormalMode, enterVisualMode, enterCommandMode };
