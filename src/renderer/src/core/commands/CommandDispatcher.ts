import { CommandParser, ParseResult } from '@renderer/core/commands/CommandParser';
import * as CommandRegistry from '@renderer/core/commands/CommandRegistry';
import { AnchorLineModeParser } from '@renderer/core/commands/parsers/AnchorLineModeParser';
import { InsertModeParser } from '@renderer/core/commands/parsers/InsertModeParser';
import { LineModeParser } from '@renderer/core/commands/parsers/LineModeParser';
import { NormalModeParser } from '@renderer/core/commands/parsers/NormalModeParser';
import { TextModeParser } from '@renderer/core/commands/parsers/TextModeParser';
import { VisualModeParser } from '@renderer/core/commands/parsers/VisualModeParser';
import { DocumentModel } from '@renderer/core/document/Document';
import { Editor, setCommandBuffer } from '@renderer/core/editor/Editor';
import { FlattenSpatialIndex } from '@renderer/core/geometry/spatial-index/FlattenSpatialIndex';
import { SpatialIndex } from '@renderer/core/geometry/SpatialIndex';
import { DocumentStore } from '@renderer/ui/Store';
import { produceWithPatches } from 'immer';

import { History } from '../document/History';

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
  private textModeParser: CommandParser = new TextModeParser();

  private history = new History<DocumentModel>();

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
    const beforeDocument = document; // for recording in history

    // check if command is a history command
    const isHistoryCommand =
      commandFunc === CommandRegistry.undo || commandFunc === CommandRegistry.redo;

    // to command args takes in editor and document and converts it to a command arg object
    // which is an object that holds the editor, document, spatial index and any additional
    // args needed for the command
    const result = commandFunc(this.toCommandArgs(editor, document));

    if (!(result instanceof Promise)) {
      const [updatedEditor, updatedDocument] = result;

      this.recordHistory(beforeDocument, updatedDocument, isHistoryCommand);

      const clearedCommandBufferEditor = setCommandBuffer(updatedEditor, '');
      this.callback({ editor: clearedCommandBufferEditor, document: updatedDocument });
      return;
    }

    result
      .then(([updatedEditor, updatedDocument]) => {
        this.recordHistory(beforeDocument, updatedDocument, isHistoryCommand);
        const clearedCommandBufferEditor = setCommandBuffer(updatedEditor, '');
        this.callback({ editor: clearedCommandBufferEditor, document: updatedDocument });
      })
      .catch((error) => {
        // TODO: add some error message to the editor state and show it in the UI
        console.error('Command execution failed:', error);
        this.callback({ editor, document });
      });
  }

  private recordHistory(
    beforeDocument: DocumentModel,
    afterDocument: DocumentModel,
    isHistoryCommand: boolean,
  ): void {
    // rebuild spatial index with updated document
    this.spatialIndex = new FlattenSpatialIndex();
    afterDocument.shapes.forEach((shape) => this.spatialIndex.addShape(shape));

    // record the command in history before updating the state
    if (afterDocument !== beforeDocument && !isHistoryCommand) {
      const [_, patches, inversePatches] = produceWithPatches(beforeDocument, (draft) =>
        Object.assign(draft, afterDocument),
      ); // get patches to update the document and inverse patches to undo the update
      if (patches.length > 0) {
        this.history.record({ patches, backwardPatches: inversePatches });
      }
    }
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
      case 'text':
        return this.textModeParser;
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
      history: this.history,
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
