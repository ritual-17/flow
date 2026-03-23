// Mock Transform.compileShapeTextContent so tests don't depend on DOM/ImageCompiler
jest.mock('@renderer/core/geometry/Transform', () => {
  const actual = jest.requireActual('@renderer/core/geometry/Transform');
  return {
    ...actual,
    Transform: {
      ...actual.Transform,
      compileShapeTextContent: jest.fn(async (shape: unknown) => shape),
    },
  };
});
// structuredClone is not available in the test environment, so we polyfill it with JSON deep clone for testing purposes.
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = <T>(val: T): T => JSON.parse(JSON.stringify(val));
}

import { CommandArgs } from '@renderer/core/commands/CommandRegistry';
import * as ManipulationCommands from '@renderer/core/commands/ManipulationCommands';
import { Document, DocumentModel } from '@renderer/core/document/Document';
import { History } from '@renderer/core/document/History';
import {
  createEditor,
  Editor,
  setClipboard,
  setCurrentAnchorPoint,
  setCurrentLineId,
  setCursorPosition,
  setMode,
  setSelectedShapes,
} from '@renderer/core/editor/Editor';
import * as CircleShape from '@renderer/core/geometry/shapes/Circle';
import * as MultiLineShape from '@renderer/core/geometry/shapes/MultiLine';
import * as PointShape from '@renderer/core/geometry/shapes/Point';
import { FlattenSpatialIndex } from '@renderer/core/geometry/spatial-index/FlattenSpatialIndex';
import { produceWithPatches } from 'immer';

function makeDoc(...shapes: Parameters<typeof Document.addShapesToDocument>[1]): DocumentModel {
  let doc = Document.createNewDocument('test');
  if (shapes.length) doc = Document.addShapesToDocument(doc, shapes);
  return doc;
}

function makeArgs(
  overrides: Partial<Omit<CommandArgs, 'editor'>> & { editor?: Partial<Editor> } = {},
): CommandArgs {
  const doc = overrides.document ?? makeDoc();
  const history = overrides.history ?? new History<DocumentModel>();
  const spatialIndex = overrides.spatialIndex ?? new FlattenSpatialIndex();

  // Pre-populate a freshly created spatial index with any shapes already in the document.
  // If the caller supplied their own spatialIndex we assume they've populated it themselves.
  if (!overrides.spatialIndex) {
    for (const shape of doc.shapes.values()) {
      spatialIndex.addShape(shape);
    }
  }

  const editor: Editor = { ...createEditor(), ...overrides.editor };

  return {
    document: doc,
    spatialIndex,
    history,
    args: {},
    ...overrides,
    editor,
  } as unknown as CommandArgs;
}

/** Build args where the given shapes are pre-loaded into the doc, spatial index, and selection. */
function makeArgsWithSelection(shapes: ReturnType<typeof CircleShape.build>[]): CommandArgs {
  const doc = makeDoc(...shapes);
  const spatialIndex = new FlattenSpatialIndex();
  shapes.forEach((s) => spatialIndex.addShape(s));
  const editor = setSelectedShapes(
    createEditor(),
    shapes.map((s) => s.id),
  );
  return makeArgs({ editor, document: doc, spatialIndex });
}

describe('createCircle', () => {
  it('adds a circle to the document at the cursor position', () => {
    const args = makeArgs({ editor: { cursorPosition: { x: 42, y: 88 } } });
    const [, doc] = ManipulationCommands.createCircle(args);
    const shapes = Array.from(doc.shapes.values());
    expect(shapes).toHaveLength(1);
    expect(shapes[0].type).toBe('circle');
    expect(shapes[0].x).toBe(42);
    expect(shapes[0].y).toBe(88);
  });

  it('clamps circle position to prevent negative coordinates', () => {
    const args = makeArgs({ editor: { cursorPosition: { x: 10, y: 20 } } });
    const [, doc] = ManipulationCommands.createCircle(args);
    const shapes = Array.from(doc.shapes.values());
    expect(shapes[0].x).toBe(50); // clamped from 10 to 50
    expect(shapes[0].y).toBe(50); // clamped from 20 to 50
  });

  it('adds the circle to the spatial index', () => {
    const args = makeArgs({ editor: { cursorPosition: { x: 60, y: 70 } } });
    const [, doc] = ManipulationCommands.createCircle(args);
    const id = Array.from(doc.shapes.keys())[0];
    expect(args.spatialIndex.getShapes().map((s) => s.id)).toContain(id);
  });

  it('returns the original editor unchanged', () => {
    const args = makeArgs();
    const [editor] = ManipulationCommands.createCircle(args);
    expect(editor).toBe(args.editor);
  });
});

describe('createRectangle', () => {
  it('adds a rectangle at the cursor position', () => {
    const args = makeArgs({ editor: { cursorPosition: { x: 5, y: 15 } } });
    const [, doc] = ManipulationCommands.createRectangle(args);
    const shapes = Array.from(doc.shapes.values());
    expect(shapes[0].type).toBe('rectangle');
    expect(shapes[0].x).toBe(5);
    expect(shapes[0].y).toBe(15);
  });

  it('clamps rectangle position to prevent negative coordinates', () => {
    const args = makeArgs({ editor: { cursorPosition: { x: -10, y: -20 } } });
    const [, doc] = ManipulationCommands.createRectangle(args);
    const shapes = Array.from(doc.shapes.values());
    expect(shapes[0].x).toBe(0); // clamped from -10 to 0
    expect(shapes[0].y).toBe(0); // clamped from -20 to 0
  });

  it('adds it to the spatial index', () => {
    const args = makeArgs();
    const [, _doc] = ManipulationCommands.createRectangle(args);
    expect(args.spatialIndex.getShapes()).toHaveLength(1);
    expect(args.spatialIndex.getShapes()[0].type).toBe('rectangle');
  });
});

describe('createSquare', () => {
  it('adds a square at the cursor position', () => {
    const args = makeArgs({ editor: { cursorPosition: { x: 200, y: 300 } } });
    const [, doc] = ManipulationCommands.createSquare(args);
    const shapes = Array.from(doc.shapes.values());
    expect(shapes[0].type).toBe('square');
    expect(shapes[0].x).toBe(200);
    expect(shapes[0].y).toBe(300);
  });

  it('clamps square position to prevent negative coordinates', () => {
    const args = makeArgs({ editor: { cursorPosition: { x: -5, y: -15 } } });
    const [, doc] = ManipulationCommands.createSquare(args);
    const shapes = Array.from(doc.shapes.values());
    expect(shapes[0].x).toBe(0); // clamped from -5 to 0
    expect(shapes[0].y).toBe(0); // clamped from -15 to 0
  });
});

describe('createTextBox', () => {
  it('adds a textBox to the document at the cursor position', async () => {
    const args = makeArgs({ editor: { cursorPosition: { x: 55, y: 66 } } });
    const [, doc] = await ManipulationCommands.createTextBox(args);
    const shapes = Array.from(doc.shapes.values());
    expect(shapes[0].type).toBe('textBox');
    expect(shapes[0].x).toBe(55);
    expect(shapes[0].y).toBe(66);
  });

  it('clamps textBox position to prevent negative coordinates', async () => {
    const args = makeArgs({ editor: { cursorPosition: { x: -30, y: -40 } } });
    const [, doc] = await ManipulationCommands.createTextBox(args);
    const shapes = Array.from(doc.shapes.values());
    expect(shapes[0].x).toBe(0); // clamped from -30 to 0
    expect(shapes[0].y).toBe(0); // clamped from -40 to 0
  });

  it('adds the textBox to the spatial index', async () => {
    const args = makeArgs();
    await ManipulationCommands.createTextBox(args);
    expect(args.spatialIndex.getShapes()).toHaveLength(1);
  });
});

const TRANSLATE_AMOUNT = 10;
describe('translateSelectionUp', () => {
  it('moves all selected shapes up by TRANSLATE_AMOUNT', () => {
    const c = CircleShape.build({ id: 'c1', x: 100, y: 200 });
    const args = makeArgsWithSelection([c]);
    const [, doc] = ManipulationCommands.translateSelectionUp(args);
    expect(Document.getShapeById(doc, 'c1').y).toBe(200 - TRANSLATE_AMOUNT);
    expect(Document.getShapeById(doc, 'c1').x).toBe(100);
  });

  it('throws when no shapes are selected', () => {
    const args = makeArgs();
    expect(() => ManipulationCommands.translateSelectionUp(args)).toThrow('No shapes selected');
  });

  it('clears the boxSelectAnchor on the returned editor', () => {
    const c = CircleShape.build({ id: 'c2', x: 100, y: 100 });
    let args = makeArgsWithSelection([c]);
    args = { ...args, editor: { ...args.editor, boxSelectAnchor: { x: 105, y: 105 } } };
    const [editor] = ManipulationCommands.translateSelectionUp(args);
    expect(editor.boxSelectAnchor).toBeUndefined();
  });
});

describe('translateSelectionDown', () => {
  it('moves all selected shapes down by TRANSLATE_AMOUNT', () => {
    const c = CircleShape.build({ id: 'd1', x: 100, y: 200 });
    const args = makeArgsWithSelection([c]);
    const [, doc] = ManipulationCommands.translateSelectionDown(args);
    expect(Document.getShapeById(doc, 'd1').y).toBe(200 + TRANSLATE_AMOUNT);
  });
});

describe('translateSelectionLeft', () => {
  it('moves all selected shapes left by TRANSLATE_AMOUNT', () => {
    const c = CircleShape.build({ id: 'l1', x: 100, y: 200 });
    const args = makeArgsWithSelection([c]);
    const [, doc] = ManipulationCommands.translateSelectionLeft(args);
    expect(Document.getShapeById(doc, 'l1').x).toBe(100 - TRANSLATE_AMOUNT);
    expect(Document.getShapeById(doc, 'l1').y).toBe(200);
  });
});

describe('translateSelectionRight', () => {
  it('moves all selected shapes right by TRANSLATE_AMOUNT', () => {
    const c = CircleShape.build({ id: 'r1', x: 100, y: 200 });
    const args = makeArgsWithSelection([c]);
    const [, doc] = ManipulationCommands.translateSelectionRight(args);
    expect(Document.getShapeById(doc, 'r1').x).toBe(100 + TRANSLATE_AMOUNT);
  });

  it('translates multiple selected shapes', () => {
    const c1 = CircleShape.build({ id: 'mr1', x: 50, y: 50 });
    const c2 = CircleShape.build({ id: 'mr2', x: 100, y: 100 });
    const args = makeArgsWithSelection([c1, c2]);
    const [, doc] = ManipulationCommands.translateSelectionRight(args);
    expect(Document.getShapeById(doc, 'mr1').x).toBe(50 + TRANSLATE_AMOUNT);
    expect(Document.getShapeById(doc, 'mr2').x).toBe(100 + TRANSLATE_AMOUNT);
  });

  it('updates the spatial index after translation', () => {
    const c = CircleShape.build({ id: 'si1', x: 100, y: 100, radius: 10 });
    const args = makeArgsWithSelection([c]);
    ManipulationCommands.translateSelectionRight(args);
    const indexed = args.spatialIndex.getShapes().find((s) => s.id === 'si1');
    expect(indexed?.x).toBe(100 + TRANSLATE_AMOUNT);
  });

  it('does not translate when any part of the selection would cross into negative coordinates', () => {
    const c = CircleShape.build({ id: 'neg1', x: 15, y: 15, radius: 10 });
    const args = makeArgsWithSelection([c]);

    const [, doc] = ManipulationCommands.translateSelectionLeft(args);

    // Attempting to move left by 10 would place circle left edge at -5.
    expect(Document.getShapeById(doc, 'neg1').x).toBe(15);
    expect(Document.getShapeById(doc, 'neg1').y).toBe(15);
  });
});

describe('deleteSelection', () => {
  it('is a no-op when nothing is selected', () => {
    const c = CircleShape.build({ id: 'del-noop' });
    const doc = makeDoc(c);
    const spatialIndex = new FlattenSpatialIndex();
    spatialIndex.addShape(c);
    const args = makeArgs({ document: doc, spatialIndex });
    const [editor, resultDoc] = ManipulationCommands.deleteSelection(args);
    expect(resultDoc.shapes.size).toBe(1);
    expect(editor).toBe(args.editor);
  });

  it('removes the selected shape from the document', () => {
    const c = CircleShape.build({ id: 'del1', x: 50, y: 50 });
    const args = makeArgsWithSelection([c]);
    const [, doc] = ManipulationCommands.deleteSelection(args);
    expect(doc.shapes.has('del1')).toBe(false);
  });

  it('removes the shape from the spatial index', () => {
    const c = CircleShape.build({ id: 'del2', x: 50, y: 50 });
    const args = makeArgsWithSelection([c]);
    ManipulationCommands.deleteSelection(args);
    expect(args.spatialIndex.getShapes().map((s) => s.id)).not.toContain('del2');
  });

  it('sets editor mode to normal after deletion', () => {
    const c = CircleShape.build({ id: 'del3' });
    let args = makeArgsWithSelection([c]);
    args = { ...args, editor: setMode(args.editor, 'visual') };
    const [editor] = ManipulationCommands.deleteSelection(args);
    expect(editor.mode).toBe('normal');
  });

  it('clears the selection after deletion', () => {
    const c = CircleShape.build({ id: 'del4' });
    const args = makeArgsWithSelection([c]);
    const [editor] = ManipulationCommands.deleteSelection(args);
    expect(editor.selectedShapeIds).toHaveLength(0);
  });

  it('removes multiple shapes', () => {
    const c1 = CircleShape.build({ id: 'dm1' });
    const c2 = CircleShape.build({ id: 'dm2', x: 500 });
    const c3 = CircleShape.build({ id: 'dm3', x: 900 });
    const doc = makeDoc(c1, c2, c3);
    const spatialIndex = new FlattenSpatialIndex();
    [c1, c2, c3].forEach((s) => spatialIndex.addShape(s));
    const editor = setSelectedShapes(createEditor(), ['dm1', 'dm2']);
    const args = makeArgs({ editor, document: doc, spatialIndex });
    const [, resultDoc] = ManipulationCommands.deleteSelection(args);
    expect(resultDoc.shapes.has('dm1')).toBe(false);
    expect(resultDoc.shapes.has('dm2')).toBe(false);
    expect(resultDoc.shapes.has('dm3')).toBe(true);
  });
});

describe('yankSelection', () => {
  it('is a no-op when nothing is selected', () => {
    const args = makeArgs();
    const [editor, doc] = ManipulationCommands.yankSelection(args);
    expect(editor).toBe(args.editor);
    expect(doc).toBe(args.document);
  });

  it('puts copies of selected shapes on the clipboard', () => {
    const c = CircleShape.build({ id: 'y1', x: 100, y: 100 });
    const args = makeArgsWithSelection([c]);
    const [editor] = ManipulationCommands.yankSelection(args);
    expect(editor.clipboard).toHaveLength(1);
    expect(editor.clipboard[0].type).toBe('circle');
  });

  it('clipboard shapes are translated to be relative to the selection center', () => {
    const c = CircleShape.build({ id: 'y2', x: 100, y: 200 });
    const args = makeArgsWithSelection([c]);
    const [editor] = ManipulationCommands.yankSelection(args);
    // Single shape: center is (100, 200), so relative position should be (0, 0)
    expect(editor.clipboard[0].x).toBe(0);
    expect(editor.clipboard[0].y).toBe(0);
  });

  it('does not remove shapes from the document', () => {
    const c = CircleShape.build({ id: 'y3' });
    const args = makeArgsWithSelection([c]);
    const [, doc] = ManipulationCommands.yankSelection(args);
    expect(doc.shapes.has('y3')).toBe(true);
  });

  it('sets mode to normal after yanking', () => {
    const c = CircleShape.build({ id: 'y4' });
    let args = makeArgsWithSelection([c]);
    args = { ...args, editor: setMode(args.editor, 'visual') };
    const [editor] = ManipulationCommands.yankSelection(args);
    expect(editor.mode).toBe('normal');
  });

  it('clears the selection after yanking', () => {
    const c = CircleShape.build({ id: 'y5' });
    const args = makeArgsWithSelection([c]);
    const [editor] = ManipulationCommands.yankSelection(args);
    expect(editor.selectedShapeIds).toHaveLength(0);
  });

  it('sets a status message describing how many objects were yanked', () => {
    const c1 = CircleShape.build({ id: 'ys1', x: 0, y: 0 });
    const c2 = CircleShape.build({ id: 'ys2', x: 100, y: 0 });
    const args = makeArgsWithSelection([c1, c2]);
    const [editor] = ManipulationCommands.yankSelection(args);
    expect(editor.statusMessage).toMatch(/2 objects yanked/);
  });

  it('uses singular "object" for a single shape', () => {
    const c = CircleShape.build({ id: 'ys-single' });
    const args = makeArgsWithSelection([c]);
    const [editor] = ManipulationCommands.yankSelection(args);
    expect(editor.statusMessage).toMatch(/1 object yanked/);
  });
});

describe('paste', () => {
  it('is a no-op when clipboard is empty', async () => {
    const args = makeArgs();
    const [editor, doc] = await ManipulationCommands.paste(args);
    expect(editor).toBe(args.editor);
    expect(doc).toBe(args.document);
  });

  it('pastes clipboard shapes into the document at the cursor position', async () => {
    const c = CircleShape.build({ id: 'p1', x: 0, y: 0 }); // stored relative to origin
    const editor = setCursorPosition(setClipboard(createEditor(), [c]), { x: 200, y: 300 });
    const args = makeArgs({ editor });
    const [, doc] = await ManipulationCommands.paste(args);
    const shapes = Array.from(doc.shapes.values());
    expect(shapes).toHaveLength(1);
    expect(shapes[0].type).toBe('circle');
    // Pasted at cursor (200, 300), original was at (0, 0), so new position = (200, 300)
    expect(shapes[0].x).toBe(200);
    expect(shapes[0].y).toBe(300);
  });

  it('pasted shapes get new ids, not equal to clipboard ids', async () => {
    const c = CircleShape.build({ id: 'orig-id', x: 0, y: 0 });
    const editor = setClipboard(createEditor(), [c]);
    const args = makeArgs({ editor });
    const [, doc] = await ManipulationCommands.paste(args);
    const shapes = Array.from(doc.shapes.values());
    expect(shapes[0].id).not.toBe('orig-id');
  });

  it('adds the pasted shape to the spatial index', async () => {
    const c = CircleShape.build({ id: 'p-si', x: 0, y: 0 });
    const editor = setClipboard(createEditor(), [c]);
    const args = makeArgs({ editor });
    await ManipulationCommands.paste(args);
    expect(args.spatialIndex.getShapes()).toHaveLength(1);
  });

  it('deletes the current selection before pasting', async () => {
    const existing = CircleShape.build({ id: 'pre-existing', x: 500, y: 500 });
    const doc = makeDoc(existing);
    const spatialIndex = new FlattenSpatialIndex();
    spatialIndex.addShape(existing);
    const clipboard = CircleShape.build({ id: 'pasted', x: 0, y: 0 });
    const editor = setClipboard(setSelectedShapes(createEditor(), ['pre-existing']), [clipboard]);
    const args = makeArgs({ editor, document: doc, spatialIndex });
    const [, resultDoc] = await ManipulationCommands.paste(args);
    expect(resultDoc.shapes.has('pre-existing')).toBe(false);
  });

  it('pastes multiple clipboard shapes', async () => {
    const c1 = CircleShape.build({ id: 'pm1', x: 0, y: 0 });
    const c2 = CircleShape.build({ id: 'pm2', x: 10, y: 10 });
    const editor = setClipboard(createEditor(), [c1, c2]);
    const args = makeArgs({ editor });
    const [, doc] = await ManipulationCommands.paste(args);
    expect(doc.shapes.size).toBe(2);
  });
});

describe('startNewLine', () => {
  it('creates a point shape at the cursor position', () => {
    const args = makeArgs({ editor: { cursorPosition: { x: 33, y: 44 } } });
    const [, doc] = ManipulationCommands.startNewLine(args);
    const shapes = Array.from(doc.shapes.values());
    expect(shapes).toHaveLength(1);
    expect(shapes[0].type).toBe('point');
    expect(shapes[0].x).toBe(33);
    expect(shapes[0].y).toBe(44);
  });

  it('sets currentLineId on the returned editor', () => {
    const args = makeArgs({ editor: { cursorPosition: { x: 0, y: 0 } } });
    const [editor, doc] = ManipulationCommands.startNewLine(args);
    const pointId = Array.from(doc.shapes.keys())[0];
    expect(editor.currentLineId).toBe(pointId);
  });
});

describe('addPointToLine', () => {
  it('starts a new line (creates a point) when there is no currentLineId', () => {
    const args = makeArgs({ editor: { cursorPosition: { x: 10, y: 20 } } });
    const [editor, doc] = ManipulationCommands.addPointToLine(args);
    const shapes = Array.from(doc.shapes.values());
    expect(shapes[0].type).toBe('point');
    expect(editor.currentLineId).not.toBeNull();
  });

  it('converts a point into a multi-line when currentLineId is a point', () => {
    const startPoint = PointShape.build({ id: 'lp-start', x: 0, y: 0 });
    const doc = makeDoc(startPoint);
    const spatialIndex = new FlattenSpatialIndex();
    spatialIndex.addShape(startPoint);
    const editor = setCurrentLineId(
      setCursorPosition(createEditor(), { x: 100, y: 100 }),
      'lp-start',
    );
    const args = makeArgs({ editor, document: doc, spatialIndex });
    const [updatedEditor, updatedDoc] = ManipulationCommands.addPointToLine(args);
    const shape = Document.getShapeById(updatedDoc, 'lp-start');
    expect(shape.type).toBe('multi-line');
    expect(updatedEditor.currentLineId).toBe('lp-start');
  });

  it('appends a point to an existing multi-line', () => {
    const line = MultiLineShape.build({
      id: 'ml-existing',
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
      ],
    });
    const doc = makeDoc(line);
    const spatialIndex = new FlattenSpatialIndex();
    spatialIndex.addShape(line);
    const editor = setCurrentLineId(
      setCursorPosition(createEditor(), { x: 100, y: 0 }),
      'ml-existing',
    );
    const args = makeArgs({ editor, document: doc, spatialIndex });
    const [, updatedDoc] = ManipulationCommands.addPointToLine(args);
    const updatedLine = Document.getShapeById(updatedDoc, 'ml-existing');
    expect(updatedLine.type).toBe('multi-line');
    if (updatedLine.type === 'multi-line') {
      expect(updatedLine.points).toHaveLength(3);
    }
  });

  it('throws when currentLineId points to a non-point, non-multi-line shape', () => {
    const circle = CircleShape.build({ id: 'bad-type' });
    const doc = makeDoc(circle);
    const spatialIndex = new FlattenSpatialIndex();
    spatialIndex.addShape(circle);
    const editor = setCurrentLineId(createEditor(), 'bad-type');
    const args = makeArgs({ editor, document: doc, spatialIndex });
    expect(() => ManipulationCommands.addPointToLine(args)).toThrow();
  });
});

describe('addAnchorPointToLine', () => {
  it('throws when there is no currentAnchorPoint', () => {
    const args = makeArgs();
    expect(() => ManipulationCommands.addAnchorPointToLine(args)).toThrow(
      'No current anchor point',
    );
  });

  it('creates a starting point when there is no currentLineId', () => {
    const circle = CircleShape.build({ id: 'anchor-src', x: 100, y: 100, radius: 50 });
    const doc = makeDoc(circle);
    const spatialIndex = new FlattenSpatialIndex();
    spatialIndex.addShape(circle);
    const anchorPoint = { ownerId: 'anchor-src', position: 0, x: 100, y: 50 };
    const editor = setCurrentAnchorPoint(createEditor(), anchorPoint);
    const args = makeArgs({ editor, document: doc, spatialIndex });
    const [updatedEditor, updatedDoc] = ManipulationCommands.addAnchorPointToLine(args);
    const shapes = Array.from(updatedDoc.shapes.values());
    // Original circle + new starting point
    expect(shapes.length).toBe(2);
    const newPoint = shapes.find((s) => s.id !== 'anchor-src')!;
    expect(newPoint.type).toBe('point');
    expect(updatedEditor.currentLineId).toBe(newPoint.id);
  });

  it('converts a starting point into a multi-line when adding a second anchor', () => {
    const circle = CircleShape.build({ id: 'anc2-src', x: 100, y: 100, radius: 50 });
    const startPoint = PointShape.build({ id: 'anc2-start', x: 100, y: 50 });
    const doc = makeDoc(circle, startPoint);
    const spatialIndex = new FlattenSpatialIndex();
    spatialIndex.addShape(circle);
    spatialIndex.addShape(startPoint);
    const anchorPoint = { ownerId: 'anc2-src', position: 2, x: 100, y: 150 };
    let editor = setCurrentAnchorPoint(createEditor(), anchorPoint);
    editor = setCurrentLineId(editor, 'anc2-start');
    const args = makeArgs({ editor, document: doc, spatialIndex });
    const [, updatedDoc] = ManipulationCommands.addAnchorPointToLine(args);
    const line = Document.getShapeById(updatedDoc, 'anc2-start');
    expect(line.type).toBe('multi-line');
  });

  it('appends an anchor ref to an existing multi-line', () => {
    const circle = CircleShape.build({ id: 'anc3-src', x: 200, y: 200, radius: 50 });
    const line = MultiLineShape.build({
      id: 'anc3-line',
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
    });
    const doc = makeDoc(circle, line);
    const spatialIndex = new FlattenSpatialIndex();
    spatialIndex.addShape(circle);
    spatialIndex.addShape(line);
    const anchorPoint = { ownerId: 'anc3-src', position: 0, x: 200, y: 150 };
    let editor = setCurrentAnchorPoint(createEditor(), anchorPoint);
    editor = setCurrentLineId(editor, 'anc3-line');
    const args = makeArgs({ editor, document: doc, spatialIndex });
    const [, updatedDoc] = ManipulationCommands.addAnchorPointToLine(args);
    const updatedLine = Document.getShapeById(updatedDoc, 'anc3-line');
    if (updatedLine.type === 'multi-line') {
      expect(updatedLine.points).toHaveLength(3);
    }
  });
});

describe('undo', () => {
  it('returns the original document when history is empty', () => {
    const args = makeArgs();
    const [, doc] = ManipulationCommands.undo(args);
    expect(doc).toBe(args.document);
  });

  it('reverts the document to a previous state', () => {
    const history = new History<DocumentModel>();
    const originalDoc = makeDoc();
    const [nextDoc, patches, backwardPatches] = produceWithPatches(
      originalDoc,
      (draft: DocumentModel) => {
        const c = CircleShape.build({ id: 'undo-c' });
        draft.shapes.set(c.id, c);
      },
    );
    history.record({ patches, backwardPatches });
    const args = makeArgs({ document: nextDoc, history });
    const [, resultDoc] = ManipulationCommands.undo(args);
    expect(resultDoc.shapes.has('undo-c')).toBe(false);
  });
});

describe('redo', () => {
  it('returns the current document when redo stack is empty', () => {
    const args = makeArgs();
    const [, doc] = ManipulationCommands.redo(args);
    expect(doc).toBe(args.document);
  });

  it('re-applies a change after undo', () => {
    const history = new History<DocumentModel>();
    const originalDoc = makeDoc();
    const [withCircle, patches, backwardPatches] = produceWithPatches(
      originalDoc,
      (draft: DocumentModel) => {
        const c = CircleShape.build({ id: 'redo-c' });
        draft.shapes.set(c.id, c);
      },
    );
    history.record({ patches, backwardPatches });
    const afterUndo = history.undo(withCircle);
    expect(afterUndo.shapes.has('redo-c')).toBe(false);
    const args = makeArgs({ document: afterUndo, history });
    const [, resultDoc] = ManipulationCommands.redo(args);
    expect(resultDoc.shapes.has('redo-c')).toBe(true);
  });
});

describe('cycleArrowOnSelection', () => {
  function makeLine(id: string, arrowStart = false, arrowEnd = false) {
    return MultiLineShape.build({
      id,
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      arrowStart,
      arrowEnd,
    });
  }

  function argsWithLine(line: ReturnType<typeof makeLine>, selectedIds = [line.id]) {
    const doc = makeDoc(line);
    const spatialIndex = new FlattenSpatialIndex();
    spatialIndex.addShape(line);
    const editor = setSelectedShapes(createEditor(), selectedIds);
    return makeArgs({ editor, document: doc, spatialIndex });
  }

  it('none → end: sets arrowEnd=true, arrowStart=false', () => {
    const line = makeLine('arrow-1', false, false);
    const [, doc] = ManipulationCommands.cycleArrowOnSelection(argsWithLine(line));
    const updated = Document.getShapeById(doc, 'arrow-1');
    if (updated.type === 'multi-line') {
      expect(updated.arrowEnd).toBe(true);
      expect(updated.arrowStart).toBe(false);
    }
  });

  it('end → both: sets arrowStart=true, arrowEnd=true', () => {
    const line = makeLine('arrow-2', false, true);
    const [, doc] = ManipulationCommands.cycleArrowOnSelection(argsWithLine(line));
    const updated = Document.getShapeById(doc, 'arrow-2');
    if (updated.type === 'multi-line') {
      expect(updated.arrowStart).toBe(true);
      expect(updated.arrowEnd).toBe(true);
    }
  });

  it('both → start: sets arrowStart=true, arrowEnd=false', () => {
    const line = makeLine('arrow-3', true, true);
    const [, doc] = ManipulationCommands.cycleArrowOnSelection(argsWithLine(line));
    const updated = Document.getShapeById(doc, 'arrow-3');
    if (updated.type === 'multi-line') {
      expect(updated.arrowStart).toBe(true);
      expect(updated.arrowEnd).toBe(false);
    }
  });

  it('start → none: sets arrowStart=false, arrowEnd=false', () => {
    const line = makeLine('arrow-4', true, false);
    const [, doc] = ManipulationCommands.cycleArrowOnSelection(argsWithLine(line));
    const updated = Document.getShapeById(doc, 'arrow-4');
    if (updated.type === 'multi-line') {
      expect(updated.arrowStart).toBe(false);
      expect(updated.arrowEnd).toBe(false);
    }
  });

  it('returns unchanged when nothing selected and no nearest shape', () => {
    const args = makeArgs();
    const [editor, doc] = ManipulationCommands.cycleArrowOnSelection(args);
    expect(editor).toBe(args.editor);
    expect(doc).toBe(args.document);
  });

  it('in line mode, prefers currentLineId over selectedShapeIds', () => {
    const line = makeLine('cycle-line', false, false);
    const doc = makeDoc(line);
    const spatialIndex = new FlattenSpatialIndex();
    spatialIndex.addShape(line);
    let editor = setMode(createEditor(), 'line');
    editor = setCurrentLineId(editor, 'cycle-line');
    const args = makeArgs({ editor, document: doc, spatialIndex });
    const [, updatedDoc] = ManipulationCommands.cycleArrowOnSelection(args);
    const updated = Document.getShapeById(updatedDoc, 'cycle-line');
    if (updated.type === 'multi-line') {
      expect(updated.arrowEnd).toBe(true);
    }
  });

  it('clears the boxSelectAnchor on the returned editor', () => {
    const line = makeLine('arrow-box');
    const doc = makeDoc(line);
    const spatialIndex = new FlattenSpatialIndex();
    spatialIndex.addShape(line);
    let editor = setSelectedShapes(createEditor(), ['arrow-box']);
    editor = { ...editor, boxSelectAnchor: { x: 1, y: 1 } };
    const args = makeArgs({ editor, document: doc, spatialIndex });
    const [updatedEditor] = ManipulationCommands.cycleArrowOnSelection(args);
    expect(updatedEditor.boxSelectAnchor).toBeUndefined();
  });
});

describe('addShapeToDocument', () => {
  it('adds the shape to both document and spatial index', () => {
    const args = makeArgs();
    const c = CircleShape.build({ id: 'util-add' });
    const doc = ManipulationCommands.addShapeToDocument(args, c);
    expect(doc.shapes.has('util-add')).toBe(true);
    expect(args.spatialIndex.getShapes().map((s) => s.id)).toContain('util-add');
  });
});

describe('addShapesToDocument', () => {
  it('adds multiple shapes to both document and spatial index', () => {
    const args = makeArgs();
    const shapes = [
      CircleShape.build({ id: 'util-m1' }),
      CircleShape.build({ id: 'util-m2', x: 200 }),
    ];
    const doc = ManipulationCommands.addShapesToDocument(args, shapes);
    expect(doc.shapes.has('util-m1')).toBe(true);
    expect(doc.shapes.has('util-m2')).toBe(true);
    expect(args.spatialIndex.getShapes()).toHaveLength(2);
  });
});

describe('updateShapeInDocument', () => {
  it('updates the shape in both the document and the spatial index', () => {
    const c = CircleShape.build({ id: 'upd-util', x: 0, y: 0, radius: 10 });
    const doc = makeDoc(c);
    const spatialIndex = new FlattenSpatialIndex();
    spatialIndex.addShape(c);
    const args = makeArgs({ document: doc, spatialIndex });
    const updated = { ...c, x: 500, y: 500 };
    const resultDoc = ManipulationCommands.updateShapeInDocument(args, updated);
    expect(Document.getShapeById(resultDoc, 'upd-util').x).toBe(500);
    const indexedShape = spatialIndex.getShapes().find((s) => s.id === 'upd-util')!;
    expect(indexedShape.x).toBe(500);
  });
});
