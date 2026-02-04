import { CommandParser, ParseResult } from '@renderer/core/commands/CommandParser';
import * as CommandRegistry from '@renderer/core/commands/CommandRegistry';
import { AnchorLineModeParser } from '@renderer/core/commands/parsers/AnchorLineModeParser';
import { InsertModeParser } from '@renderer/core/commands/parsers/InsertModeParser';
import { LineModeParser } from '@renderer/core/commands/parsers/LineModeParser';
import { NormalModeParser } from '@renderer/core/commands/parsers/NormalModeParser';
import { VisualModeParser } from '@renderer/core/commands/parsers/VisualModeParser';
import { DocumentModel } from '@renderer/core/document/Document';
import { Editor, setCommandBuffer } from '@renderer/core/editor/Editor';
import { FlattenSpatialIndex } from '@renderer/core/geometry/spatial-index/FlattenSpatialIndex';
import { SpatialIndex } from '@renderer/core/geometry/SpatialIndex';
import { DocumentStore } from '@renderer/ui/Store';

type CommandDispatcherCallback = (partial: Partial<DocumentStore>) => void;

export class CommandDispatcher {
  private callback: CommandDispatcherCallback;

  public spatialIndex: SpatialIndex = new FlattenSpatialIndex();
  private normalModeParser: CommandParser = new NormalModeParser();
  private insertModeParser: CommandParser = new InsertModeParser();
  private visualModeParser: CommandParser = new VisualModeParser();
  private commandModeParser: CommandParser = new NormalModeParser();
  private lineModeParser: CommandParser = new LineModeParser();
  private anchorLineModeParser: CommandParser = new AnchorLineModeParser();

  constructor(callback: CommandDispatcherCallback) {
    this.callback = callback;
  }

  dispatchCommand(editor: Editor, document: DocumentModel): void {
    const parser = this.getCommandParser(editor);
    const inputCommand = editor.commandBuffer;

    const command = parser.parse(inputCommand);

    this.maybeDispatch(editor, document, command);
  }

  // checks if the user input command is valid and if a command function exists for it before dispatching
  private maybeDispatch(editor: Editor, document: DocumentModel, parserResult: ParseResult): void {
    const { command, newCommandBuffer } = parserResult;

    if (isInvalidCommand(command)) {
      this.updateCommandBuffer(editor, document, newCommandBuffer);
      return;
    }

    const commandFunc = CommandRegistry.commandFromName(command);

    if (isInvalidCommandFunction(commandFunc)) {
      this.clearCommandBuffer(editor, document);
      return;
    }

    this.dispatch(editor, document, commandFunc);
  }

  private updateCommandBuffer(
    editor: Editor,
    document: DocumentModel,
    newCommandBuffer: string,
  ): void {
    const updatedEditor = setCommandBuffer(editor, newCommandBuffer);
    this.callback({ editor: updatedEditor, document });
  }

  private clearCommandBuffer(editor: Editor, document: DocumentModel): void {
    const updatedEditor = setCommandBuffer(editor, '');
    this.callback({ editor: updatedEditor, document });
  }

  // this can dispatch both sync and async commands. For reference on an async command, see createTextBox in ManipulationCommands.ts
  private dispatch(
    editor: Editor,
    document: DocumentModel,
    commandFunc: CommandRegistry.CommandFunction,
  ): void {
    const result = commandFunc(this.toCommandArgs(editor, document));

    if (!(result instanceof Promise)) {
      const [updatedEditor, updatedDocument] = result;
      const clearedCommandBufferEditor = setCommandBuffer(updatedEditor, '');
      this.callback({ editor: clearedCommandBufferEditor, document: updatedDocument });
      return;
    }

    result.then(([updatedEditor, updatedDocument]) => {
      const clearedCommandBufferEditor = setCommandBuffer(updatedEditor, '');
      this.callback({ editor: clearedCommandBufferEditor, document: updatedDocument });
    });
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

function isInvalidCommand(command: string | null): command is null {
  return command === null;
}

function isInvalidCommandFunction(
  commandFunc: CommandRegistry.CommandFunction | null,
): commandFunc is null {
  return commandFunc === null;
}
