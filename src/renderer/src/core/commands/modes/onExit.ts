// command functions to call when leaving a mode to clean up the editor state

import { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import { setEditingTextBoxId } from '@renderer/core/editor/Editor';

const onExitCommands: { [mode: string]: (args: CommandArgs) => CommandResult } = {
  text: onExitTextMode,
  // add other modes here if they need cleanup on exit
};

export function previousModeExitCleanup(args: CommandArgs): CommandResult {
  const { editor } = args;
  const onExitCommand = onExitCommands[editor.mode];
  if (onExitCommand) {
    return onExitCommand(args);
  }
  // no cleanup needed for this mode
  return [editor, args.document];
}

function onExitTextMode({ editor, document }: CommandArgs): CommandResult {
  // clear the current text box being edited
  const updatedEditor = setEditingTextBoxId(editor, null);
  return [updatedEditor, document];
}
