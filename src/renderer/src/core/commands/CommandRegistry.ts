// Maps command name to handler
//

import {
  autoLinkAddToLine,
  autoLinkCircle,
  autoLinkRectangle,
  autoLinkSquare,
  autoLinkTextBox,
} from '@renderer/core/commands/AutoLinkCommands';
import {
  centerViewportOnCursor,
  cursorDown,
  cursorDownFast,
  cursorLeft,
  cursorLeftFast,
  cursorRight,
  cursorRightFast,
  cursorUp,
  cursorUpFast,
  enterAnchorLineMode,
  enterAutoLinkInsertMode,
  enterCommandMode,
  enterInsertMode,
  enterLineMode,
  enterNormalMode,
  enterTextMode,
  enterTextModeForNearestTextBox,
  enterTextModeFromLineMode,
  enterVisualBlockMode,
  enterVisualMode,
  moveCursorToMiddle,
  selectNextSearchResult,
  selectPreviousSearchResult,
} from '@renderer/core/commands/EditorCommands';
import {
  addAnchorPointToLine,
  addPointToLine,
  createCircle,
  createRectangle,
  createSquare,
  createTextBox,
  cycleArrowOnSelection,
  deleteSelection,
  paste,
  redo,
  startNewLine,
  translateFastSelectionDown,
  translateFastSelectionLeft,
  translateFastSelectionRight,
  translateFastSelectionUp,
  translateSelectionDown,
  translateSelectionLeft,
  translateSelectionRight,
  translateSelectionUp,
  undo,
  yankSelection,
} from '@renderer/core/commands/ManipulationCommands';
import { importPdf } from '@renderer/core/commands/PdfCommands';
import {
  jumpToDownAnchorPoint,
  jumpToLeftAnchorPoint,
  jumpToRightAnchorPoint,
  jumpToUpAnchorPoint,
  toggleBoxSelect,
  toggleSelectShapeAtPoint,
  visualDown,
  visualLeft,
  visualRight,
  visualUp,
} from '@renderer/core/commands/VisualCommands';
import { DocumentModel } from '@renderer/core/document/Document';
import { History } from '@renderer/core/document/History';
import { Editor } from '@renderer/core/editor/Editor';
import { SpatialIndex } from '@renderer/core/geometry/SpatialIndex';

export type CommandArgs = {
  editor: Editor;
  document: DocumentModel;
  spatialIndex: SpatialIndex;
  history: History<DocumentModel>;
  args: Record<string, unknown>;
};

export type CommandResult = [Editor, DocumentModel];

export type CommandFunction = (args: CommandArgs) => Promise<CommandResult> | CommandResult;

function commandFromName(command: string): CommandFunction | null {
  switch (command) {
    case 'enterNormalMode':
      return enterNormalMode;
    case 'enterInsertMode':
      return enterInsertMode;
    case 'enterVisualMode':
      return enterVisualMode;
    case 'enterVisualBlockMode':
      return enterVisualBlockMode;
    case 'enterCommandMode':
      return enterCommandMode;
    case 'enterLineMode':
      return enterLineMode;
    case 'enterAnchorLineMode':
      return enterAnchorLineMode;
    case 'newLine':
      return startNewLine;
    case 'enterTextMode':
      return enterTextMode;
    case 'enterTextModeForNearestTextBox':
      return enterTextModeForNearestTextBox;
    case 'enterTextModeFromLineMode':
      return enterTextModeFromLineMode;
    case 'enterAutoLinkInsertMode':
      return enterAutoLinkInsertMode;
    case 'up':
      return cursorUp;
    case 'down':
      return cursorDown;
    case 'left':
      return cursorLeft;
    case 'right':
      return cursorRight;
    case 'fastUp':
      return cursorUpFast;
    case 'fastDown':
      return cursorDownFast;
    case 'fastLeft':
      return cursorLeftFast;
    case 'fastRight':
      return cursorRightFast;
    case 'moveCursorToMiddle':
      return moveCursorToMiddle;
    case 'moveScreenToCursor':
      return centerViewportOnCursor;
    case 'createCircle':
      return createCircle;
    case 'createRectangle':
      return createRectangle;
    case 'createSquare':
      return createSquare;
    case 'createTextBox':
      return createTextBox;
    case 'autoLinkCircle':
      return autoLinkCircle;
    case 'autoLinkRectangle':
      return autoLinkRectangle;
    case 'autoLinkSquare':
      return autoLinkSquare;
    case 'autoLinkTextBox':
      return autoLinkTextBox;
    case 'autoLinkAddToLine':
      return autoLinkAddToLine;
    case 'selectNextSearchResult':
      return selectNextSearchResult;
    case 'selectPreviousSearchResult':
      return selectPreviousSearchResult;
    case 'downAnchor':
      return jumpToDownAnchorPoint;
    case 'upAnchor':
      return jumpToUpAnchorPoint;
    case 'leftAnchor':
      return jumpToLeftAnchorPoint;
    case 'rightAnchor':
      return jumpToRightAnchorPoint;
    case 'addAnchorPointToLine':
      return addAnchorPointToLine;
    case 'linePoint':
      return addPointToLine;
    case 'translateSelectionUp':
      return translateSelectionUp;
    case 'translateSelectionDown':
      return translateSelectionDown;
    case 'translateSelectionLeft':
      return translateSelectionLeft;
    case 'translateSelectionRight':
      return translateSelectionRight;
    case 'translateFastSelectionUp':
      return translateFastSelectionUp;
    case 'translateFastSelectionDown':
      return translateFastSelectionDown;
    case 'translateFastSelectionLeft':
      return translateFastSelectionLeft;
    case 'translateFastSelectionRight':
      return translateFastSelectionRight;
    case 'deleteSelection':
      return deleteSelection;
    case 'yankSelection':
      return yankSelection;
    case 'toggleSelectShapeAtCursor':
      return toggleSelectShapeAtPoint;
    case 'toggleBoxSelect':
      return toggleBoxSelect;
    case 'pasteAfter':
    case 'pasteOverSelection':
      return paste;
    case 'toggleArrow':
      return cycleArrowOnSelection;
    case 'visualUp':
      return visualUp;
    case 'visualDown':
      return visualDown;
    case 'visualLeft':
      return visualLeft;
    case 'visualRight':
      return visualRight;
    case 'importPdf':
      return importPdf;
    case 'undo':
      return undo;
    case 'redo':
      return redo;
    default:
      return null;
  }
}
export { commandFromName, undo, redo };
