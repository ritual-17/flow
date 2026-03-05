import { ParseResult } from '@renderer/core/commands/CommandParser';
import { AnchorLineModeParser } from '@renderer/core/commands/parsers/AnchorLineModeParser';
import { CommandModeParser } from '@renderer/core/commands/parsers/CommandModeParser';
import { InsertModeParser } from '@renderer/core/commands/parsers/InsertModeParser';
import { LineModeParser } from '@renderer/core/commands/parsers/LineModeParser';
import { NormalModeParser } from '@renderer/core/commands/parsers/NormalModeParser';
import { TextModeParser } from '@renderer/core/commands/parsers/TextModeParser';
import { VisualBlockModeParser } from '@renderer/core/commands/parsers/VisualBlockModeParser';
import { VisualModeParser } from '@renderer/core/commands/parsers/VisualModeParser';

function exactResult(command: string): ParseResult {
  return { newCommandBuffer: '', command };
}

function pendingResult(input: string): ParseResult {
  return { newCommandBuffer: input, command: null };
}

const noMatch: ParseResult = { newCommandBuffer: '', command: null };

// Shared behaviour – all parsers inherit the "all" keymap (<Esc>)
describe.each([
  ['NormalModeParser', () => new NormalModeParser()],
  ['InsertModeParser', () => new InsertModeParser()],
  ['VisualModeParser', () => new VisualModeParser()],
  ['VisualBlockModeParser', () => new VisualBlockModeParser()],
  ['CommandModeParser', () => new CommandModeParser()],
  ['LineModeParser', () => new LineModeParser()],
  ['AnchorLineModeParser', () => new AnchorLineModeParser()],
  ['TextModeParser', () => new TextModeParser()],
])('%s – shared "all" keymap', (_name, factory) => {
  let parser: ReturnType<typeof factory>;

  beforeEach(() => {
    parser = factory();
  });

  test('<Esc> resolves to enterNormalMode', () => {
    expect(parser.parse('<Esc>')).toEqual(exactResult('enterNormalMode'));
  });

  test('unknown single key returns no-match', () => {
    expect(parser.parse('Z')).toEqual(noMatch);
  });

  test('empty string returns no-match', () => {
    expect(parser.parse('')).toEqual(noMatch);
  });
});

// NormalModeParser

describe('NormalModeParser', () => {
  let parser: NormalModeParser;

  beforeEach(() => {
    parser = new NormalModeParser();
  });

  describe('single-key commands', () => {
    test.each([
      ['j', 'down'],
      ['k', 'up'],
      ['h', 'left'],
      ['l', 'right'],
      ['i', 'enterInsertMode'],
      ['v', 'enterVisualMode'],
      ['V', 'enterVisualBlockMode'],
      ['t', 'enterTextMode'],
      ['T', 'enterTextModeForNearestTextBox'],
      ['p', 'pasteAfter'],
      ['u', 'undo'],
      ['r', 'redo'],
      ['n', 'selectNextSearchResult'],
      ['N', 'selectPreviousSearchResult'],
      ['a', 'enterLineMode'],
      ['A', 'enterAnchorLineMode'],
      ['f', 'importPdf'],
      ['M', 'moveCursorToMiddle'],
    ])('"%s" → %s', (key, command) => {
      expect(parser.parse(key)).toEqual(exactResult(command));
    });
  });

  describe('arrow key commands', () => {
    test.each([
      ['ArrowUp', 'up'],
      ['ArrowDown', 'down'],
      ['ArrowLeft', 'left'],
      ['ArrowRight', 'right'],
    ])('"%s" → %s', (key, command) => {
      expect(parser.parse(key)).toEqual(exactResult(command));
    });
  });

  describe('multi-key sequences', () => {
    test('"d" alone is a pending prefix (could be "dd")', () => {
      expect(parser.parse('d')).toEqual(pendingResult('d'));
    });

    test('"dd" resolves to deleteLine', () => {
      expect(parser.parse('dd')).toEqual(exactResult('deleteLine'));
    });

    test('"y" alone is a pending prefix (could be "yy")', () => {
      expect(parser.parse('y')).toEqual(pendingResult('y'));
    });

    test('"yy" resolves to yankLine', () => {
      expect(parser.parse('yy')).toEqual(exactResult('yankLine'));
    });

    test('incomplete sequence clears on non-prefix input', () => {
      // 'd' followed by an unrelated key should produce no-match for the full string
      expect(parser.parse('dz')).toEqual(noMatch);
    });
  });
});

// InsertModeParser

describe('InsertModeParser', () => {
  let parser: InsertModeParser;

  beforeEach(() => {
    parser = new InsertModeParser();
  });

  test.each([
    ['j', 'down'],
    ['k', 'up'],
    ['h', 'left'],
    ['l', 'right'],
    ['c', 'createCircle'],
    ['t', 'createTextBox'],
    ['r', 'createRectangle'],
    ['s', 'createSquare'],
  ])('"%s" → %s', (key, command) => {
    expect(parser.parse(key)).toEqual(exactResult(command));
  });

  test('arrow keys work in insert mode', () => {
    expect(parser.parse('ArrowUp')).toEqual(exactResult('up'));
    expect(parser.parse('ArrowDown')).toEqual(exactResult('down'));
  });
});

// VisualModeParser

describe('VisualModeParser', () => {
  let parser: VisualModeParser;

  beforeEach(() => {
    parser = new VisualModeParser();
  });

  test.each([
    ['j', 'visualDown'],
    ['k', 'visualUp'],
    ['h', 'visualLeft'],
    ['l', 'visualRight'],
    ['d', 'deleteSelection'],
    ['y', 'yankSelection'],
    ['p', 'pasteOverSelection'],
    ['K', 'translateSelectionUp'],
    ['J', 'translateSelectionDown'],
    ['L', 'translateSelectionRight'],
    ['H', 'translateSelectionLeft'],
    ['n', 'selectNextSearchResult'],
    ['N', 'selectPreviousSearchResult'],
    ['<Space>', 'toggleSelectShapeAtCursor'],
    ['V', 'enterVisualBlockMode'],
    ['M', 'moveCursorToMiddle'],
    ['<Shift-ArrowUp>', 'translateSelectionUp'],
    ['<Shift-ArrowDown>', 'translateSelectionDown'],
    ['<Shift-ArrowRight>', 'translateSelectionRight'],
    ['<Shift-ArrowLeft>', 'translateSelectionLeft'],
  ])('"%s" → %s', (key, command) => {
    expect(parser.parse(key)).toEqual(exactResult(command));
  });
});

// VisualBlockModeParser

describe('VisualBlockModeParser', () => {
  let parser: VisualBlockModeParser;

  beforeEach(() => {
    parser = new VisualBlockModeParser();
  });

  test('"v" switches back to visual mode', () => {
    expect(parser.parse('v')).toEqual(exactResult('enterVisualMode'));
  });

  test('"<Space>" toggles box select', () => {
    expect(parser.parse('<Space>')).toEqual(exactResult('toggleBoxSelect'));
  });

  test.each([
    ['d', 'deleteSelection'],
    ['y', 'yankSelection'],
    ['p', 'pasteOverSelection'],
  ])('"%s" → %s', (key, command) => {
    expect(parser.parse(key)).toEqual(exactResult(command));
  });
});

// CommandModeParser

describe('CommandModeParser', () => {
  let parser: CommandModeParser;

  beforeEach(() => {
    parser = new CommandModeParser();
  });

  test('"w" saves file', () => {
    expect(parser.parse('w')).toEqual(exactResult('saveFile'));
  });

  test('"q" quits editor', () => {
    expect(parser.parse('q')).toEqual(exactResult('quitEditor'));
  });

  describe('multi-key sequences', () => {
    test('"w" is also a prefix for "wq"', () => {
      // 'w' alone is an exact match for saveFile, so it resolves immediately
      expect(parser.parse('w')).toEqual(exactResult('saveFile'));
    });

    test('"wq" resolves to saveAndQuit', () => {
      expect(parser.parse('wq')).toEqual(exactResult('saveAndQuit'));
    });

    test('"q" is a prefix for "q!"', () => {
      // 'q' alone is an exact match for quitEditor
      expect(parser.parse('q')).toEqual(exactResult('quitEditor'));
    });

    test('"q!" resolves to forceQuit', () => {
      expect(parser.parse('q!')).toEqual(exactResult('forceQuit'));
    });
  });
});

// LineModeParser

describe('LineModeParser', () => {
  let parser: LineModeParser;

  beforeEach(() => {
    parser = new LineModeParser();
  });

  test.each([
    ['j', 'down'],
    ['k', 'up'],
    ['h', 'left'],
    ['l', 'right'],
    ['<Space>', 'linePoint'],
    ['s', 'squareLine'],
    ['c', 'curvedLine'],
    ['A', 'enterAnchorLineMode'],
    ['t', 'enterTextModeFromLineMode'],
    ['e', 'toggleArrow'],
  ])('"%s" → %s', (key, command) => {
    expect(parser.parse(key)).toEqual(exactResult(command));
  });
});

// AnchorLineModeParser

describe('AnchorLineModeParser', () => {
  let parser: AnchorLineModeParser;

  beforeEach(() => {
    parser = new AnchorLineModeParser();
  });

  test.each([
    ['j', 'downAnchor'],
    ['k', 'upAnchor'],
    ['h', 'leftAnchor'],
    ['l', 'rightAnchor'],
    ['ArrowUp', 'upAnchor'],
    ['ArrowDown', 'downAnchor'],
    ['ArrowLeft', 'leftAnchor'],
    ['ArrowRight', 'rightAnchor'],
    ['<Space>', 'addAnchorPointToLine'],
    ['a', 'enterLineMode'],
    ['t', 'enterTextModeFromLineMode'],
    ['e', 'toggleArrow'],
  ])('"%s" → %s', (key, command) => {
    expect(parser.parse(key)).toEqual(exactResult(command));
  });
});

// TextModeParser

describe('TextModeParser', () => {
  let parser: TextModeParser;

  beforeEach(() => {
    parser = new TextModeParser();
  });

  test('only inherits the "all" keymap – <Esc> works', () => {
    expect(parser.parse('<Esc>')).toEqual(exactResult('enterNormalMode'));
  });

  test('regular keys produce no-match (text mode passes keys through)', () => {
    expect(parser.parse('a')).toEqual(noMatch);
    expect(parser.parse('b')).toEqual(noMatch);
  });
});

// updateKeymap – dynamic remapping

describe('updateKeymap', () => {
  test('adds a new binding that resolves on parse', () => {
    const parser = new NormalModeParser();
    parser.updateKeymap('gz', 'myCustomCommand');
    expect(parser.parse('gz')).toEqual(exactResult('myCustomCommand'));
  });

  test('overrides an existing binding', () => {
    const parser = new NormalModeParser();
    parser.updateKeymap('j', 'customDown');
    expect(parser.parse('j')).toEqual(exactResult('customDown'));
  });

  test('new binding participates in prefix matching', () => {
    const parser = new NormalModeParser();
    parser.updateKeymap('gzz', 'deepCommand');
    // 'g' is a prefix of 'gzz'
    expect(parser.parse('g')).toEqual(pendingResult('g'));
    // 'gz' is a prefix of 'gzz'
    expect(parser.parse('gz')).toEqual(pendingResult('gz'));
    // 'gzz' is the exact match
    expect(parser.parse('gzz')).toEqual(exactResult('deepCommand'));
  });

  test('each parser instance has independent keymaps', () => {
    const a = new NormalModeParser();
    const b = new NormalModeParser();
    a.updateKeymap('gz', 'onlyInA');
    expect(a.parse('gz')).toEqual(exactResult('onlyInA'));
    expect(b.parse('gz')).toEqual(noMatch);
  });
});

// ParseResult shape

describe('ParseResult shape', () => {
  const parser = new NormalModeParser();

  test('exact match clears the buffer', () => {
    const result = parser.parse('j');
    expect(result.newCommandBuffer).toBe('');
    expect(result.command).toBe('down');
  });

  test('prefix match keeps the input in the buffer', () => {
    const result = parser.parse('d');
    expect(result.newCommandBuffer).toBe('d');
    expect(result.command).toBeNull();
  });

  test('no-match clears the buffer and returns null command', () => {
    const result = parser.parse('Z');
    expect(result.newCommandBuffer).toBe('');
    expect(result.command).toBeNull();
  });
});
