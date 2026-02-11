import defaultKeymaps from '@renderer/config/defaultKeymaps.json';
import { CommandParser } from '@renderer/core/commands/CommandParser';
import { KeyMap } from '@renderer/core/commands/KeyMaps';

export class VisualBlockModeParser extends CommandParser {
  constructor() {
    super();
    const keymap = defaultKeymaps['visual-block'] as KeyMap;
    Object.assign(this.commandKeyMap, keymap);
  }
}
