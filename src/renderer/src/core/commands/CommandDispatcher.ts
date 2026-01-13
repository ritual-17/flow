import { CommandParser, ParseResult } from '@renderer/core/commands/CommandParser';
import * as CommandRegistry from '@renderer/core/commands/CommandRegistry';
import { InsertModeParser } from '@renderer/core/commands/parsers/InsertModeParser';
import { NormalModeParser } from '@renderer/core/commands/parsers/NormalModeParser';
import { DocumentModel } from '@renderer/core/document/Document';
import { Editor, updateCommandBuffer } from '@renderer/core/editor/Editor';
import { FlattenSpatialIndex } from '@renderer/core/geometry/shape/FlattenSpatialIndex';
import { SpatialIndex } from '@renderer/core/geometry/SpatialIndex';

export class CommandDispatcher {
  private spatialIndex: SpatialIndex = new FlattenSpatialIndex();
  private normalModeParser: CommandParser = new NormalModeParser();
  private insertModeParser: CommandParser = new InsertModeParser();

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
      const updatedEditor = updateCommandBuffer(editor, newCommandBuffer);
      return [updatedEditor, document];
    }

    const commandFunc = CommandRegistry.commandFromName(command);
    if (commandFunc === null) {
      const updatedEditor = updateCommandBuffer(editor, '');
      return [updatedEditor, document];
    }

    const [updatedEditor, updatedDocument] = commandFunc(editor, document, this.spatialIndex);

    const clearedCommandBufferEditor = updateCommandBuffer(updatedEditor, '');

    return [clearedCommandBufferEditor, updatedDocument];
  }

  private getCommandParser(editor: Editor) {
    switch (editor.mode) {
      case 'normal':
        return this.normalModeParser;
      case 'insert':
        return this.insertModeParser;
      default:
        // update this
        return this.normalModeParser;
    }
  }
}
