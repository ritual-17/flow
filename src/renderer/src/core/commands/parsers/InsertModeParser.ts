import defaultKeymaps from '@renderer/config/defaultKeymaps.json';
import { CommandParser } from '@renderer/core/commands/CommandParser';
import { KeyMap } from '@renderer/core/commands/KeyMaps';

export class InsertModeParser extends CommandParser {
  constructor() {
    super();
    const commandModeKeymap = defaultKeymaps['insert'] as KeyMap;
    this.commandKeyMap = { ...commandModeKeymap };
  }
}
