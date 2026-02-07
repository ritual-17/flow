// command functions to call when leaving a mode to clean up the editor state

import { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import { updateShapeInDocument } from '@renderer/core/commands/ManipulationCommands';
import { Document } from '@renderer/core/document/Document';
import { setEditingTextBox } from '@renderer/core/editor/Editor';
import { assertIsTextBox } from '@renderer/core/geometry/Shape';
import { updateTextBoxContent } from '@renderer/core/geometry/Transform';

type OnExitCommandFunction = (args: CommandArgs) => Promise<CommandResult>;
const onExitCommands: { [mode: string]: OnExitCommandFunction } = {
  text: onExitTextMode,
  // add other modes here if they need cleanup on exit
};

export async function previousModeExitCleanup(args: CommandArgs): Promise<CommandResult> {
  const { editor } = args;
  const onExitCommand = onExitCommands[editor.mode];
  if (onExitCommand) {
    return onExitCommand(args);
  }
  // no cleanup needed for this mode
  return [editor, args.document];
}

async function onExitTextMode(args: CommandArgs): Promise<CommandResult> {
  const { editor, document } = args;
  if (!editor.currentTextBox) {
    return [editor, document];
  }
  const { id: textBoxId, content: updatedContent } = editor.currentTextBox;
  const textBox = Document.getShapeById(document, textBoxId);
  assertIsTextBox(textBox);
  const updatedTextBox = await updateTextBoxContent(textBox, updatedContent);

  const updatedDocument = updateShapeInDocument(args, updatedTextBox);
  // clear the current text box being edited
  const updatedEditor = setEditingTextBox(editor, null);
  return [updatedEditor, updatedDocument];
}
