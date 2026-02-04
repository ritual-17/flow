// Parses Commands from keys.
// For example in vim, takes in keys "ciw" and parses this as a complete command.

import defaultKeymaps from '@renderer/config/defaultKeymaps.json';
import { KeyMap } from '@renderer/core/commands/KeyMaps';

export abstract class CommandParser implements CommandParser {
  protected commandKeyMap: KeyMap = {};

  constructor() {
    const allKeymaps = defaultKeymaps['all'] as KeyMap;
    this.commandKeyMap = { ...allKeymaps };
  }

  parse(input: string): ParseResult {
    const exactCommand = this.exactMatch(input);
    if (exactCommand !== null) {
      return {
        newCommandBuffer: '',
        command: exactCommand,
      };
    }

    if (this.prefixMatch(input)) {
      return {
        newCommandBuffer: input,
        command: null,
      };
    }

    return {
      newCommandBuffer: '',
      command: null,
    };
  }

  updateKeymap(keys: string, command: string): void {
    this.commandKeyMap[keys] = command;
  }

  private exactMatch(input: string): string | null {
    const keymaps = Object.keys(this.commandKeyMap);

    for (const keys of keymaps) {
      if (this.isExact(input, keys)) {
        return this.commandKeyMap[keys];
      }
    }

    return null;
  }

  private prefixMatch(input: string): boolean {
    const keymaps = Object.keys(this.commandKeyMap);

    for (const keys of keymaps) {
      if (this.isPrefix(input, keys)) {
        return true;
      }
    }

    return false;
  }

  private isExact(input: string, keys: string): boolean {
    return keys === input;
  }

  private isPrefix(input: string, keys: string): boolean {
    return keys.startsWith(input);
  }
}

export interface ParseResult {
  newCommandBuffer: string;
  command: string | null;
}
