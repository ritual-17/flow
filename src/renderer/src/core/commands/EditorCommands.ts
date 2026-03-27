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
import { toggleBoxSelect, toggleSelectShapeAtPoint } from '@renderer/core/commands/VisualCommands';
import { updateBoxSelection } from '@renderer/core/commands/VisualCommands';
import {
  clearBoxSelectAnchor,
  clearSelection,
  helperKeepCursorInViewport,
  helperPanViewportForItem,
  setCurrentAnchorRef,
  setCurrentLineId,
  setCurrentTextBox,
  setCursorPosition,
  setMode,
  setSelectedShapes,
} from '@renderer/core/editor/Editor';
import { resolvePointCoordinate } from '@renderer/core/geometry/utils/AnchorPoints';
import { useStore } from '@renderer/ui/Store';

const CURSOR_MOVE_AMOUNT = 10;
const FAST_CURSOR_MOVE_AMOUNT = 50;

async function enterNormalMode(args: CommandArgs): Promise<CommandResult> {
  // disabling because it is complaining updatedDocument is not reassigned
  // eslint-disable-next-line prefer-const
  let [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);

  updatedEditor = setSelectedShapes(updatedEditor, []);
  updatedEditor = clearBoxSelectAnchor(updatedEditor);
  updatedEditor = setMode(updatedEditor, 'normal');
  updatedEditor = setCurrentLineId(updatedEditor, null);

  return [updatedEditor, updatedDocument];
}

async function enterInsertMode(args: CommandArgs): Promise<CommandResult> {
  const [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);
  return [setMode(updatedEditor, 'insert'), updatedDocument];
}

async function enterVisualMode(args: CommandArgs): Promise<CommandResult> {
  let [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);
  updatedEditor = setMode(updatedEditor, 'visual');
  updatedEditor = clearSelection(updatedEditor);

  // toggle selection of shape at cursor position if it exists, otherwise just enter visual mode with no selection
  [updatedEditor, updatedDocument] = toggleSelectShapeAtPoint({
    editor: updatedEditor,
    document: updatedDocument,
    spatialIndex: args.spatialIndex,
    history: args.history,
    args: {},
  });
  return [updatedEditor, updatedDocument];
}

async function enterVisualBlockMode(args: CommandArgs): Promise<CommandResult> {
  let [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);
  updatedEditor = setMode(updatedEditor, 'visual-block');
  updatedEditor = clearSelection(updatedEditor);

  [updatedEditor, updatedDocument] = toggleBoxSelect({
    editor: updatedEditor,
    document: updatedDocument,
    spatialIndex: args.spatialIndex,
    history: args.history,
    args: {},
  });
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

// enters text mode on the nearest shape (i.e. either a text box or label of a shape)
async function enterTextMode(args: CommandArgs): Promise<CommandResult> {
  const { spatialIndex } = args;
  // disabling because it is complaining updatedDocument is not reassigned
  // eslint-disable-next-line prefer-const
  let [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);

  const nearestShape = spatialIndex.getNearestShape(updatedEditor.cursorPosition);
  if (!nearestShape) return [updatedEditor, updatedDocument];

  updatedEditor = setMode(updatedEditor, 'text');
  updatedEditor = setCursorPosition(updatedEditor, { x: nearestShape.x, y: nearestShape.y });
  updatedEditor = setCurrentTextBox(updatedEditor, {
    id: nearestShape.id,
    content: nearestShape.label.text,
  });
  return [updatedEditor, updatedDocument];
}

async function enterTextModeFromLineMode(args: CommandArgs): Promise<CommandResult> {
  const { spatialIndex } = args;
  // disabling because it is complaining updatedDocument is not reassigned
  // eslint-disable-next-line prefer-const
  let [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);

  const line = spatialIndex.getNearestLineCenter(updatedEditor.cursorPosition);
  if (!line) return [updatedEditor, updatedDocument];

  const { line: nearestLine, point: point } = line;

  updatedEditor = setMode(updatedEditor, 'text');
  updatedEditor = setCursorPosition(updatedEditor, { x: point.x, y: point.y });
  updatedEditor = setCurrentTextBox(updatedEditor, {
    id: nearestLine.id,
    content: nearestLine.label.text,
  });
  return [updatedEditor, updatedDocument];
}

async function enterAnchorLineMode(args: CommandArgs): Promise<CommandResult> {
  const { spatialIndex } = args;
  // disabling because it is complaining updatedDocument is not reassigned
  // eslint-disable-next-line prefer-const
  let [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);
  const nearestAnchorPoint = spatialIndex.getNearestAnchorRef(updatedEditor.cursorPosition);

  // if there is an anchor point nearby, snap to it, otherwise just enter line mode starting at the cursor
  if (nearestAnchorPoint) {
    const anchorCoordinate = resolvePointCoordinate(updatedDocument, nearestAnchorPoint);
    updatedEditor = setCursorPosition(updatedEditor, anchorCoordinate);
    updatedEditor = setCurrentAnchorRef(updatedEditor, nearestAnchorPoint);
    return [setMode(updatedEditor, 'anchor-line'), updatedDocument];
  }

  return [setMode(updatedEditor, 'line'), updatedDocument];
}

// enters text mode for the nearest text box (not label)
async function enterTextModeForNearestTextBox(args: CommandArgs): Promise<CommandResult> {
  const { spatialIndex } = args;
  // disabling because it is complaining updatedDocument is not reassigned
  // eslint-disable-next-line prefer-const
  let [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);

  const nearestTextBox = spatialIndex.getNearestTextBox(updatedEditor.cursorPosition);
  if (nearestTextBox) {
    updatedEditor = setMode(updatedEditor, 'text');
    updatedEditor = setCursorPosition(updatedEditor, { x: nearestTextBox.x, y: nearestTextBox.y });
    updatedEditor = setCurrentTextBox(updatedEditor, {
      id: nearestTextBox.id,
      content: nearestTextBox.label.text,
    });
    return [updatedEditor, updatedDocument];
  }

  // no text box exists so reject the command. should probably add an error message later
  return [updatedEditor, updatedDocument];
}

async function enterAutoLinkInsertMode(args: CommandArgs): Promise<CommandResult> {
  const [updatedEditor, updatedDocument] = await previousModeExitCleanup(args);
  return [setMode(updatedEditor, 'auto-link-insert'), updatedDocument];
}

function cursorUp({ editor, document }: CommandArgs): CommandResult {
  const updatedEditor = setCursorPosition(editor, {
    x: Math.max(0, editor.cursorPosition.x),
    y: Math.max(0, editor.cursorPosition.y - CURSOR_MOVE_AMOUNT),
  });
  helperPanViewportForItem('up', updatedEditor);
  return [updatedEditor, document];
}

function cursorDown({ editor, document }: CommandArgs): CommandResult {
  const updatedEditor = setCursorPosition(editor, {
    x: Math.max(0, editor.cursorPosition.x),
    y: Math.max(0, editor.cursorPosition.y + CURSOR_MOVE_AMOUNT),
  });
  helperPanViewportForItem('down', updatedEditor);
  return [updatedEditor, document];
}

function cursorLeft({ editor, document }: CommandArgs): CommandResult {
  const updatedEditor = setCursorPosition(editor, {
    x: Math.max(0, editor.cursorPosition.x - CURSOR_MOVE_AMOUNT),
    y: Math.max(0, editor.cursorPosition.y),
  });
  helperPanViewportForItem('left', updatedEditor);
  return [updatedEditor, document];
}

function cursorRight({ editor, document }: CommandArgs): CommandResult {
  const updatedEditor = setCursorPosition(editor, {
    x: Math.max(0, editor.cursorPosition.x + CURSOR_MOVE_AMOUNT),
    y: Math.max(0, editor.cursorPosition.y),
  });
  helperPanViewportForItem('right', updatedEditor);
  return [updatedEditor, document];
}

function cursorUpFast({ editor, document, spatialIndex }: CommandArgs): CommandResult {
  let updatedEditor = setCursorPosition(editor, {
    x: Math.max(0, editor.cursorPosition.x),
    y: Math.max(0, editor.cursorPosition.y - FAST_CURSOR_MOVE_AMOUNT),
  });

  if (updatedEditor.mode === 'visual-block' && updatedEditor.boxSelectAnchor) {
    updatedEditor = updateBoxSelection(updatedEditor, spatialIndex);
  }
  helperPanViewportForItem('up', updatedEditor);
  return [updatedEditor, document];
}

function cursorDownFast({ editor, document, spatialIndex }: CommandArgs): CommandResult {
  let updatedEditor = setCursorPosition(editor, {
    x: Math.max(0, editor.cursorPosition.x),
    y: Math.max(0, editor.cursorPosition.y + FAST_CURSOR_MOVE_AMOUNT),
  });

  if (updatedEditor.mode === 'visual-block' && updatedEditor.boxSelectAnchor) {
    updatedEditor = updateBoxSelection(updatedEditor, spatialIndex);
  }
  helperPanViewportForItem('down', updatedEditor);
  return [updatedEditor, document];
}

function cursorLeftFast({ editor, document, spatialIndex }: CommandArgs): CommandResult {
  let updatedEditor = setCursorPosition(editor, {
    x: Math.max(0, editor.cursorPosition.x - FAST_CURSOR_MOVE_AMOUNT),
    y: Math.max(0, editor.cursorPosition.y),
  });

  if (updatedEditor.mode === 'visual-block' && updatedEditor.boxSelectAnchor) {
    updatedEditor = updateBoxSelection(updatedEditor, spatialIndex);
  }
  helperPanViewportForItem('left', updatedEditor);
  return [updatedEditor, document];
}

function cursorRightFast({ editor, document, spatialIndex }: CommandArgs): CommandResult {
  let updatedEditor = setCursorPosition(editor, {
    x: Math.max(0, editor.cursorPosition.x + FAST_CURSOR_MOVE_AMOUNT),
    y: Math.max(0, editor.cursorPosition.y),
  });

  if (updatedEditor.mode === 'visual-block' && updatedEditor.boxSelectAnchor) {
    updatedEditor = updateBoxSelection(updatedEditor, spatialIndex);
  }
  helperPanViewportForItem('right', updatedEditor);
  return [updatedEditor, document];
}

function moveCursorToMiddle({ editor, document }: CommandArgs): CommandResult {
  const store = useStore.getState();

  // preferred: if store exposes viewport world bounds/position
  const viewport = store.viewport;
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight - 24; // status bar

  return [
    setCursorPosition(editor, {
      x: -viewport.x + canvasWidth / 2,
      y: -viewport.y + canvasHeight / 2,
    }),
    document,
  ];
}

function centerViewportOnCursor({ editor, document }: CommandArgs): CommandResult {
  const cursor = editor.cursorPosition;
  if (!cursor) return [editor, document];

  const { centerViewportOn } = useStore.getState();

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight - 24; // status bar

  centerViewportOn(cursor.x, cursor.y, canvasWidth, canvasHeight);

  return [editor, document];
}

function selectNextSearchResult({ editor, document, spatialIndex }: CommandArgs): CommandResult {
  const nextShape = spatialIndex.getNextShape(editor.cursorPosition);
  let updatedEditor = editor;
  if (nextShape) {
    updatedEditor = setCursorPosition(updatedEditor, { x: nextShape.x, y: nextShape.y });
  }
  helperPanViewportForItem('shape', updatedEditor);
  return [updatedEditor, document];
}

function selectPreviousSearchResult({
  editor,
  document,
  spatialIndex,
}: CommandArgs): CommandResult {
  const nextShape = spatialIndex.getNextShape(editor.cursorPosition, true);
  let updatedEditor = editor;
  if (nextShape) {
    updatedEditor = setCursorPosition(updatedEditor, { x: nextShape.x, y: nextShape.y });
  }
  helperPanViewportForItem('shape', updatedEditor);
  return [updatedEditor, document];
}
function selectAllShapes({ editor, document }: CommandArgs): CommandResult {
  let updatedEditor = editor;
  if (editor.mode !== 'visual' && editor.mode !== 'visual-block') {
    updatedEditor = setMode(editor, 'visual');
  }
  const allShapeIds = Array.from(document.shapes.keys());
  return [setSelectedShapes(updatedEditor, allShapeIds), document];
}

function scrollViewportUp({ editor, document }: CommandArgs): CommandResult {
  const { pan } = useStore.getState();
  pan(0, FAST_CURSOR_MOVE_AMOUNT);
  const updatedEditor = helperKeepCursorInViewport('up', editor);
  return [updatedEditor, document];
}

function scrollViewportDown({ editor, document }: CommandArgs): CommandResult {
  const { pan } = useStore.getState();
  pan(0, -FAST_CURSOR_MOVE_AMOUNT);
  const updatedEditor = helperKeepCursorInViewport('down', editor);
  return [updatedEditor, document];
}

function scrollViewportLeft({ editor, document }: CommandArgs): CommandResult {
  const { pan } = useStore.getState();
  pan(FAST_CURSOR_MOVE_AMOUNT, 0);
  const updatedEditor = helperKeepCursorInViewport('left', editor);
  return [updatedEditor, document];
}

function scrollViewportRight({ editor, document }: CommandArgs): CommandResult {
  const { pan } = useStore.getState();
  pan(-FAST_CURSOR_MOVE_AMOUNT, 0);
  const updatedEditor = helperKeepCursorInViewport('right', editor);
  return [updatedEditor, document];
}

function returnToFirstPosition({ editor, document }: CommandArgs): CommandResult {
  const { centerViewportOn } = useStore.getState();

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight - 24; // status bar

  centerViewportOn(0, 0, canvasWidth, canvasHeight);

  return [
    setCursorPosition(editor, {
      x: canvasWidth / 2,
      y: canvasHeight / 2,
    }),
    document,
  ];
}

export {
  enterInsertMode,
  enterNormalMode,
  enterVisualMode,
  enterVisualBlockMode,
  enterCommandMode,
  enterLineMode,
  enterAnchorLineMode,
  enterTextMode,
  enterTextModeForNearestTextBox,
  enterTextModeFromLineMode,
  enterAutoLinkInsertMode,
  cursorUp,
  cursorDown,
  cursorLeft,
  cursorRight,
  cursorUpFast,
  cursorDownFast,
  cursorLeftFast,
  cursorRightFast,
  moveCursorToMiddle,
  centerViewportOnCursor,
  returnToFirstPosition,
  scrollViewportUp,
  scrollViewportDown,
  scrollViewportLeft,
  scrollViewportRight,
  selectNextSearchResult,
  selectPreviousSearchResult,
  selectAllShapes,
};
