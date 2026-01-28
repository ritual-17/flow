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
  enterVisualMode,
  selectNextSearchResult,
} from '@renderer/core/commands/EditorCommands';
import { addShapeToDocument, createCircle } from '@renderer/core/commands/ManipulationCommands';
import { DocumentModel } from '@renderer/core/document/Document';
import { Editor } from '@renderer/core/editor/Editor';
import { SpatialIndex } from '@renderer/core/geometry/SpatialIndex';

export type CommandArgs = {
  editor: Editor;
  document: DocumentModel;
  spatialIndex: SpatialIndex;
  args: Record<string, unknown>;
};

export type CommandResult = [Editor, DocumentModel];

export type CommandFunction = (args: CommandArgs) => CommandResult;

function commandFromName(command: string): CommandFunction | null {
  switch (command) {
    case 'addShape':
      return addShapeToDocument;
    case 'enterNormalMode':
      return enterNormalMode;
    case 'enterInsertMode':
      return enterInsertMode;
    case 'enterVisualMode':
      return enterVisualMode;
    case 'enterCommandMode':
      return enterCommandMode;
    case 'enterLineMode':
      return enterLineMode;
    case 'enterAnchorLineMode':
      return enterAnchorLineMode;
    case 'up':
      return cursorUp;
    case 'down':
      return cursorDown;
    case 'left':
      return cursorLeft;
    case 'right':
      return cursorRight;
    case 'createCircle':
      return createCircle;
    case 'selectNextSearchResult':
      return selectNextSearchResult;
    default:
      return null;
  }
}
export { commandFromName };
