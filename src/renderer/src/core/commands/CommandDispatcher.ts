import { CommandParser, ParseResult } from '@renderer/core/commands/CommandParser';
import * as CommandRegistry from '@renderer/core/commands/CommandRegistry';
import { AnchorLineModeParser } from '@renderer/core/commands/parsers/AnchorLineModeParser';
import { InsertModeParser } from '@renderer/core/commands/parsers/InsertModeParser';
import { LineModeParser } from '@renderer/core/commands/parsers/LineModeParser';
import { NormalModeParser } from '@renderer/core/commands/parsers/NormalModeParser';
import { VisualModeParser } from '@renderer/core/commands/parsers/VisualModeParser';
import { updateBoxlSelection } from '@renderer/core/commands/VisualCommands';
import { DocumentModel } from '@renderer/core/document/Document';
import { Editor, setCommandBuffer } from '@renderer/core/editor/Editor';
import { FlattenSpatialIndex } from '@renderer/core/geometry/spatial-index/FlattenSpatialIndex';
import { SpatialIndex } from '@renderer/core/geometry/SpatialIndex';

// helper for checking if a command is for moving the cursor
function isCursorMoveCommand(command: string): boolean {
  return command === 'up' || command === 'down' || command === 'left' || command === 'right';
}

export class CommandDispatcher {
  public spatialIndex: SpatialIndex = new FlattenSpatialIndex();
  private normalModeParser: CommandParser = new NormalModeParser();
  private insertModeParser: CommandParser = new InsertModeParser();
  private visualModeParser: CommandParser = new VisualModeParser();
  private commandModeParser: CommandParser = new NormalModeParser();
  private lineModeParser: CommandParser = new LineModeParser();
  private anchorLineModeParser: CommandParser = new AnchorLineModeParser();

  dispatchCommand(editor: Editor, document: DocumentModel): [Editor, DocumentModel] {
    const parser = this.getCommandParser(editor);
    const inputCommand = editor.commandBuffer;

    const command = parser.parse(inputCommand);

    return this.maybeDispatch(editor, document, command);
  }

  private maybeDispatch(
    editor: Editor,
    document: DocumentModel,
    parserResult: ParseResult,
  ): [Editor, DocumentModel] {
    const { command, newCommandBuffer } = parserResult;

    if (command === null) {
      const updatedEditor = setCommandBuffer(editor, newCommandBuffer);
      return [updatedEditor, document];
    }

    const commandFunc = CommandRegistry.commandFromName(command);
    if (commandFunc === null) {
      const updatedEditor = setCommandBuffer(editor, '');
      return [updatedEditor, document];
    }

    const [updatedEditor, updatedDocument] = commandFunc(this.toCommandArgs(editor, document));
    let updatedVisualEditor = updatedEditor;

    // visual mode: update selection after cursor move commands
    if (editor.mode === 'visual' && isCursorMoveCommand(command)) {
      updatedVisualEditor = updateBoxlSelection(updatedEditor, this.spatialIndex);
    }

    const clearedCommandBufferEditor = setCommandBuffer(updatedVisualEditor, '');

    return [clearedCommandBufferEditor, updatedDocument];
  }

  private getCommandParser(editor: Editor) {
    switch (editor.mode) {
      case 'normal':
        return this.normalModeParser;
      case 'insert':
        return this.insertModeParser;
      case 'visual':
        return this.visualModeParser;
      case 'command':
        return this.commandModeParser;
      case 'line':
        return this.lineModeParser;
      case 'anchor-line':
        return this.anchorLineModeParser;
      default:
        // update this
        throw new Error(`Unknown editor mode: ${editor.mode}`);
    }
  }

  private toCommandArgs(editor: Editor, document: DocumentModel): CommandRegistry.CommandArgs {
    return {
      editor,
      document,
      spatialIndex: this.spatialIndex,
      args: {},
    };
  }
}
