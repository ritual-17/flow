// Maps command name to handler
//

import {
  cursorDown,
  cursorLeft,
  cursorRight,
  cursorUp,
  enterAnchorLineMode,
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
    case 'up':
      return cursorUp;
    case 'down':
      return cursorDown;
    case 'left':
      return cursorLeft;
    case 'right':
      return cursorRight;
    case 'moveCursorToMiddle':
      return moveCursorToMiddle;
    case 'createCircle':
      return createCircle;
    case 'createRectangle':
      return createRectangle;
    case 'createSquare':
      return createSquare;
    case 'createTextBox':
      return createTextBox;
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
