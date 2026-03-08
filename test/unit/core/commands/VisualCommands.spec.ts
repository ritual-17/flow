/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  deleteSelection,
  translateSelectionRight,
  translateSelectionUp,
  yankSelection,
} from '@renderer/core/commands/ManipulationCommands';
import {
  toggleBoxSelect,
  toggleSelectShapeAtPoint,
  updateBoxSelection,
  visualRight,
  visualUp,
} from '@renderer/core/commands/VisualCommands';
import * as Transform from '@renderer/core/geometry/Transform';
import { enableMapSet } from 'immer';

enableMapSet();

// Mock structuredClone for Node.js environment
global.structuredClone = jest.fn((obj) => JSON.parse(JSON.stringify(obj)));

jest.mock('@renderer/core/geometry/spatial-index/FlattenSpatialIndex', () => {
  return {
    FlattenSpatialIndex: jest.fn().mockImplementation(() => ({
      searchAtPoint: jest.fn(),
      searchInArea: jest.fn(),
      addShape: jest.fn(),
      updateShape: jest.fn(),
      removeShapesByIds: jest.fn(),
      getReferencingShapeIds: jest.fn(),
    })),
  };
});

jest.mock('@renderer/core/document/History', () => {
  return {
    History: jest.fn().mockImplementation(() => ({
      record: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn(),
    })),
  };
});

jest.mock('@renderer/ui/components/text/Editor', () => ({
  setCursorPosition: jest.fn((editor, pos) => ({ ...editor, cursorPosition: pos })),
  setBoxSelectAnchor: jest.fn((editor, pos) => ({ ...editor, boxSelectAnchor: pos })),
  clearBoxSelectAnchor: jest.fn((editor) => ({ ...editor, boxSelectAnchor: null })),
  updateBoxSelection: jest.fn((editor) => editor),
}));

describe('VisualCommands', () => {
  let mockEditor: any;
  let mockDocument: any;
  let mockHistory: any;
  let spatialIndex: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockEditor = {
      cursorPosition: { x: 100, y: 100 },
      boxSelectAnchor: null,
      selectedShapeIds: [],
      clipboard: [],
    };
    mockDocument = { shapes: new Map() };
    mockHistory = {
      record: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn(),
    };
    spatialIndex = {
      searchAtPoint: jest.fn(),
      searchInArea: jest.fn(),
      addShape: jest.fn(),
      updateShape: jest.fn(),
      removeShapesByIds: jest.fn(),
      getReferencingShapeIds: jest.fn().mockReturnValue([]),
    };
    jest.spyOn(Transform, 'compileShapeTextContent').mockImplementation(async (shape) => shape);
  });

  // test toggleSelectShapeAtPoint

  it('should do nothing if no shape at cursor when toggling select', () => {
    spatialIndex.searchAtPoint.mockReturnValue([]);
    const [updatedEditor] = toggleSelectShapeAtPoint({
      editor: mockEditor,
      document: mockDocument,
      spatialIndex,
      history: mockHistory,
      args: {},
    });
    expect(updatedEditor.selectedShapeIds).toEqual([]);
  });

  it('should select shape at cursor', () => {
    spatialIndex.searchAtPoint.mockReturnValue([{ id: 'shape1' }]);
    const [updatedEditor] = toggleSelectShapeAtPoint({
      editor: mockEditor,
      document: mockDocument,
      spatialIndex,
      history: mockHistory,
      args: {},
    });
    expect(updatedEditor.selectedShapeIds).toEqual(['shape1']);
  });

  it('should deselect shape at cursor if already selected', () => {
    spatialIndex.searchAtPoint.mockReturnValue([{ id: 'shape1' }]);
    mockEditor.selectedShapeIds = ['shape1'];
    const [updatedEditor] = toggleSelectShapeAtPoint({
      editor: mockEditor,
      document: mockDocument,
      spatialIndex,
      history: mockHistory,
      args: {},
    });
    expect(updatedEditor.selectedShapeIds).toEqual([]);
  });

  // test visual movement commands

  it('should move cursor up', () => {
    const [updatedEditor] = visualUp({
      editor: mockEditor,
      document: mockDocument,
      spatialIndex,
      history: mockHistory,
      args: {},
    });
    expect(updatedEditor.cursorPosition.y).toEqual(90);
  });

  it('should move cursor right', () => {
    const [updatedEditor] = visualRight({
      editor: mockEditor,
      document: mockDocument,
      spatialIndex,
      history: mockHistory,
      args: {},
    });
    expect(updatedEditor.cursorPosition.x).toEqual(110);
  });

  // test box selection

  it('should start box select at cursor position', () => {
    const [updatedEditor] = toggleBoxSelect({
      editor: mockEditor,
      document: mockDocument,
      spatialIndex,
      history: mockHistory,
      args: {},
    });
    expect(updatedEditor.boxSelectAnchor).toEqual({ x: 100, y: 100 });
  });

  it('should clear box select anchor if already set', () => {
    mockEditor.boxSelectAnchor = { x: 50, y: 50 };
    const [updatedEditor] = toggleBoxSelect({
      editor: mockEditor,
      document: mockDocument,
      spatialIndex,
      history: mockHistory,
      args: {},
    });
    expect(updatedEditor.boxSelectAnchor).toBeUndefined();
  });

  it('should select shapes within box', () => {
    mockEditor.boxSelectAnchor = { x: 50, y: 50 };
    spatialIndex.searchInArea.mockReturnValue([{ id: 'shape1' }, { id: 'shape2' }]);
    const updatedEditor = updateBoxSelection(mockEditor, spatialIndex);

    expect(updatedEditor.selectedShapeIds).toEqual(['shape1', 'shape2']);
  });

  it('should update box selection when moving cursor', () => {
    mockEditor.boxSelectAnchor = { x: 50, y: 50 };
    spatialIndex.searchInArea.mockReturnValue([{ id: 'shape1' }]);
    let updatedEditor = updateBoxSelection(mockEditor, spatialIndex);
    expect(updatedEditor.selectedShapeIds).toEqual(['shape1']);

    // Simulate moving cursor to the right
    updatedEditor = visualRight({
      editor: updatedEditor,
      document: mockDocument,
      spatialIndex,
      history: mockHistory,
      args: {},
    })[0];
    spatialIndex.searchInArea.mockReturnValue([{ id: 'shape1' }, { id: 'shape2' }]);
    updatedEditor = updateBoxSelection(updatedEditor, spatialIndex);
    expect(updatedEditor.selectedShapeIds).toEqual(['shape1', 'shape2']);
  });

  // translating selection tests

  it('should translate selected shapes up', () => {
    mockEditor.selectedShapeIds = ['shape1'];
    const shape1 = { id: 'shape1', x: 100, y: 100 };
    mockDocument.shapes.set('shape1', shape1);
    const [updatedEditor, updatedDocument] = translateSelectionUp({
      editor: mockEditor,
      document: mockDocument,
      spatialIndex,
      history: mockHistory,
      args: {},
    });
    expect(updatedDocument.shapes.get('shape1')?.y).toEqual(50);
  });

  it('should translate selected shapes right', () => {
    mockEditor.selectedShapeIds = ['shape1'];
    const shape1 = { id: 'shape1', x: 100, y: 100 };
    mockDocument.shapes.set('shape1', shape1);
    const [updatedEditor, updatedDocument] = translateSelectionRight({
      editor: mockEditor,
      document: mockDocument,
      spatialIndex,
      history: mockHistory,
      args: {},
    });
    expect(updatedDocument.shapes.get('shape1')?.x).toEqual(150);
  });

  // deleting selection test
  it('should delete selected shapes', () => {
    mockEditor.selectedShapeIds = ['shape1'];
    const shape1 = { id: 'shape1', x: 100, y: 100 };
    mockDocument.shapes.set('shape1', shape1);
    const [updatedEditor, updatedDocument] = deleteSelection({
      editor: mockEditor,
      document: mockDocument,
      spatialIndex,
      history: mockHistory,
      args: {},
    });
    expect(updatedDocument.shapes.size).toEqual(0);
  });

  // yankSelection test
  it('should copy selected shapes to clipboard', () => {
    mockEditor.selectedShapeIds = ['shape1'];
    const shape1 = { id: 'shape1', x: 100, y: 100 };
    mockDocument.shapes.set('shape1', shape1);
    const [updatedEditor] = yankSelection({
      editor: mockEditor,
      document: mockDocument,
      spatialIndex,
      history: mockHistory,
      args: {},
    });
    expect(updatedEditor.clipboard).toEqual([{ id: 'shape1', x: 0, y: 0 }]);
  });

  // paste test not working as it calls compileTypst which only exists at runtime, unsure how to mock it properly, leaving out for now
  // paste test
  //   it('should paste shapes from clipboard', async () => {
  //     const shape1 = {
  //       id: 'shape1',
  //       x: 0,
  //       y: 0,
  //       anchorPoints: [],
  //       zIndex: 1,
  //       strokeWidth: 2,
  //       fill: 1,
  //       strokeColor: '#ffffff',
  //       lineColor: '#aeb8c4',
  //       fillColor: '#000000',
  //       label: {
  //         text: '',
  //         compiledImageMeta: null,
  //       },
  //     };
  //     mockEditor.clipboard = [shape1];
  //     spatialIndex.getReferencingShapeIds.mockReturnValue([]);

  //     // move cursor to (110, 110) before pasting to ensure pasted shape is offset from original
  //     let [updatedEditor] = visualRight({
  //       editor: mockEditor,
  //       document: mockDocument,
  //       spatialIndex,
  //       history: mockHistory,
  //       args: {},
  //     });
  //     [updatedEditor] = visualDown({
  //       editor: mockEditor,
  //       document: mockDocument,
  //       spatialIndex,
  //       history: mockHistory,
  //       args: {},
  //     });

  //     const [, updatedDocument] = await paste({
  //       editor: mockEditor,
  //       document: mockDocument,
  //       spatialIndex,
  //       history: mockHistory,
  //       args: {},
  //     });

  //     expect(updatedDocument.shapes.size).toEqual(1);
  //     const pastedShape = [...updatedDocument.shapes.values()][0];
  //     expect(pastedShape?.x).toEqual(110); // should be offset from original position
  //     expect(pastedShape?.y).toEqual(110);
  //     expect(pastedShape?.id).not.toEqual('shape1'); // should have a new ID
  //   });
});
