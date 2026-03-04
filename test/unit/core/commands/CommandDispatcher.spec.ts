/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandDispatcher } from '@renderer/core/commands/CommandDispatcher';
import * as CommandRegistry from '@renderer/core/commands/CommandRegistry';
import { setCommandBuffer } from '@renderer/core/editor/Editor';

jest.mock('@renderer/core/commands/CommandRegistry', () => ({
  commandFromName: jest.fn(),
  undo: jest.fn(),
  redo: jest.fn(),
}));

jest.mock('@renderer/core/editor/Editor', () => ({
  setCommandBuffer: jest.fn((editor, buf) => ({ ...editor, commandBuffer: buf })),
}));

jest.mock('@renderer/core/geometry/spatial-index/FlattenSpatialIndex', () => {
  return {
    FlattenSpatialIndex: jest.fn().mockImplementation(() => ({
      addShape: jest.fn(),
    })),
  };
});

describe('CommandDispatcher', () => {
  let dispatcher: CommandDispatcher;
  let mockCallback: jest.Mock;
  let mockEditor: any;
  let mockDocument: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCallback = jest.fn();
    dispatcher = new CommandDispatcher(mockCallback);

    mockEditor = { mode: 'normal', commandBuffer: 'i' };
    mockDocument = { shapes: [] };
  });

  it('should update the command buffer when a partial command is typed', () => {
    // Simulate typing "d" (waiting for next key)
    jest.spyOn((dispatcher as any).normalModeParser, 'parse').mockReturnValue({
      command: null,
      newCommandBuffer: 'd',
    });

    dispatcher.dispatchCommand(mockEditor, mockDocument);

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        editor: expect.objectContaining({ commandBuffer: 'd' }),
      }),
    );
  });

  it('should execute a command and clear the buffer on success', () => {
    const updatedDoc = { shapes: [{ id: 'rect1' }] };
    const mockCmdFunc = jest.fn().mockReturnValue([mockEditor, updatedDoc]);

    (CommandRegistry.commandFromName as jest.Mock).mockReturnValue(mockCmdFunc);
    jest.spyOn((dispatcher as any).normalModeParser, 'parse').mockReturnValue({
      command: 'drawRect',
      newCommandBuffer: '',
    });

    dispatcher.dispatchCommand(mockEditor, mockDocument);

    expect(mockCmdFunc).toHaveBeenCalled();
    expect(setCommandBuffer).toHaveBeenCalledWith(expect.anything(), '');
    expect(mockCallback).toHaveBeenCalledWith({
      editor: expect.objectContaining({ commandBuffer: '' }),
      document: updatedDoc,
    });
  });

  it('should handle async commands and resolve with the callback', async () => {
    const updatedDoc = { shapes: [] };
    const mockCmdFunc = jest.fn().mockResolvedValue([mockEditor, updatedDoc]);

    (CommandRegistry.commandFromName as jest.Mock).mockReturnValue(mockCmdFunc);
    jest.spyOn((dispatcher as any).normalModeParser, 'parse').mockReturnValue({
      command: 'asyncTask',
      newCommandBuffer: '',
    });

    dispatcher.dispatchCommand(mockEditor, mockDocument);

    // Wait for the internal promise in dispatch() to resolve
    await new Promise(process.nextTick);

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        document: updatedDoc,
      }),
    );
  });

  it('should rebuild the spatial index and record history when document changes', () => {
    const newDocument = { shapes: [{ id: 'new' }] };
    const mockCmdFunc = jest.fn().mockReturnValue([mockEditor, newDocument]);
    (CommandRegistry.commandFromName as jest.Mock).mockReturnValue(mockCmdFunc);

    jest.spyOn((dispatcher as any).normalModeParser, 'parse').mockReturnValue({
      command: 'add',
      newCommandBuffer: '',
    });

    const historySpy = jest.spyOn((dispatcher as any).history, 'record');

    dispatcher.dispatchCommand(mockEditor, mockDocument);

    expect((dispatcher as any).spatialIndex.addShape).toHaveBeenCalledWith({ id: 'new' });
    expect(historySpy).toHaveBeenCalled();
  });
});
