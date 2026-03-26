import { Document, DocumentModel } from '@renderer/core/document/Document';
import { Shape, ShapeId } from '@renderer/core/geometry/Shape';

function makeShape(id: ShapeId, overrides: Partial<Shape> = {}): Shape {
  return { id, ...overrides } as Shape;
}

describe('Document.createNewDocument', () => {
  it('sets the document name', () => {
    const doc = Document.createNewDocument('My Doc');
    expect(doc.metadata.name).toBe('My Doc');
  });

  it('initialises with an empty shapes map', () => {
    const doc = Document.createNewDocument('Empty');
    expect(doc.shapes.size).toBe(0);
  });

  it('sets isSaved to false', () => {
    const doc = Document.createNewDocument('Unsaved');
    expect(doc.metadata.isSaved).toBe(false);
  });

  it('sets path to null', () => {
    const doc = Document.createNewDocument('No Path');
    expect(doc.metadata.path).toBeNull();
  });

  it('sets lastEdited to a recent Date', () => {
    const before = new Date();
    const doc = Document.createNewDocument('Timed');
    const after = new Date();
    expect(doc.metadata.lastEdited.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(doc.metadata.lastEdited.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});

describe('Document.updateDocumentMetadata', () => {
  let base: DocumentModel;

  beforeEach(() => {
    base = Document.createNewDocument('Original');
  });

  it('updates the document name', () => {
    const updated = Document.updateDocumentMetadata(base, { name: 'Renamed' });
    expect(updated.metadata.name).toBe('Renamed');
  });

  it('updates isSaved', () => {
    const updated = Document.updateDocumentMetadata(base, { isSaved: true });
    expect(updated.metadata.isSaved).toBe(true);
  });

  it('updates path', () => {
    const updated = Document.updateDocumentMetadata(base, { path: '/some/path.json' });
    expect(updated.metadata.path).toBe('/some/path.json');
  });

  it('applies multiple updates at once', () => {
    const updated = Document.updateDocumentMetadata(base, {
      name: 'New Name',
      isSaved: true,
      path: '/docs/new.json',
    });
    expect(updated.metadata.name).toBe('New Name');
    expect(updated.metadata.isSaved).toBe(true);
    expect(updated.metadata.path).toBe('/docs/new.json');
  });

  it('does not mutate the original document', () => {
    Document.updateDocumentMetadata(base, { name: 'Changed' });
    expect(base.metadata.name).toBe('Original');
  });

  it('preserves unrelated metadata fields', () => {
    const updated = Document.updateDocumentMetadata(base, { name: 'Only Name Changed' });
    expect(updated.metadata.isSaved).toBe(base.metadata.isSaved);
    expect(updated.metadata.path).toBe(base.metadata.path);
  });
});

describe('Document.addShapesToDocument', () => {
  let base: DocumentModel;

  beforeEach(() => {
    base = Document.createNewDocument('Doc');
  });

  it('adds a single shape', () => {
    const shape = makeShape('shape-1');
    const updated = Document.addShapesToDocument(base, [shape]);
    expect(updated.shapes.size).toBe(1);
    expect(updated.shapes.get('shape-1')).toEqual(shape);
  });

  it('adds multiple shapes', () => {
    const shapes = [makeShape('a'), makeShape('b'), makeShape('c')];
    const updated = Document.addShapesToDocument(base, shapes);
    expect(updated.shapes.size).toBe(3);
    shapes.forEach((s) => expect(updated.shapes.get(s.id)).toEqual(s));
  });

  it('does not mutate the original document', () => {
    Document.addShapesToDocument(base, [makeShape('x')]);
    expect(base.shapes.size).toBe(0);
  });

  it('overwrites an existing shape when the same id is added again', () => {
    const original = makeShape('shape-1', { x: 10 });
    const replacement = makeShape('shape-1', { x: 11 });
    const withOriginal = Document.addShapesToDocument(base, [original]);
    const withReplacement = Document.addShapesToDocument(withOriginal, [replacement]);
    expect(withReplacement.shapes.size).toBe(1);
    expect(withReplacement.shapes.get('shape-1')!.x).toBe(11);
  });

  it('handles an empty array gracefully', () => {
    const updated = Document.addShapesToDocument(base, []);
    expect(updated.shapes.size).toBe(0);
  });
});

describe('Document.removeShapesFromDocument', () => {
  let base: DocumentModel;

  beforeEach(() => {
    const shapes = [makeShape('a'), makeShape('b'), makeShape('c')];
    base = Document.addShapesToDocument(Document.createNewDocument('Doc'), shapes);
  });

  it('removes a single shape by id', () => {
    const updated = Document.removeShapesFromDocument(base, ['a']);
    expect(updated.shapes.has('a')).toBe(false);
    expect(updated.shapes.size).toBe(2);
  });

  it('removes multiple shapes by id', () => {
    const updated = Document.removeShapesFromDocument(base, ['a', 'c']);
    expect(updated.shapes.size).toBe(1);
    expect(updated.shapes.has('b')).toBe(true);
  });

  it('does not mutate the original document', () => {
    Document.removeShapesFromDocument(base, ['a']);
    expect(base.shapes.size).toBe(3);
  });

  it('ignores ids that do not exist', () => {
    const updated = Document.removeShapesFromDocument(base, ['nonexistent']);
    expect(updated.shapes.size).toBe(3);
  });

  it('handles an empty id array gracefully', () => {
    const updated = Document.removeShapesFromDocument(base, []);
    expect(updated.shapes.size).toBe(3);
  });
});

describe('Document.updateShapesInDocument', () => {
  let base: DocumentModel;

  beforeEach(() => {
    const shapes = [makeShape('a'), makeShape('b')];
    base = Document.addShapesToDocument(Document.createNewDocument('Doc'), shapes);
  });

  it('updates an existing shape', () => {
    const updatedShape = makeShape('a', { x: 10 });
    const updated = Document.updateShapesInDocument(base, [updatedShape]);
    expect(updated.shapes.get('a')!.x).toBe(10);
  });

  it('updates multiple shapes in one call', () => {
    const updatedShapes = [makeShape('a', { x: 5 }), makeShape('b', { y: 15 })];
    const updated = Document.updateShapesInDocument(base, updatedShapes);
    expect(updated.shapes.get('a')!.x).toBe(5);
    expect(updated.shapes.get('b')!.y).toBe(15);
  });

  it('does not add a shape that does not already exist', () => {
    const newShape = makeShape('does-not-exist');
    const updated = Document.updateShapesInDocument(base, [newShape]);
    expect(updated.shapes.size).toBe(2);
    expect(updated.shapes.has('does-not-exist')).toBe(false);
  });

  it('does not mutate the original document', () => {
    const updatedShape = makeShape('a', { x: 10 });
    Document.updateShapesInDocument(base, [updatedShape]);
    expect(base.shapes.get('a')!.x).toBeUndefined();
  });

  it('handles an empty array gracefully', () => {
    const updated = Document.updateShapesInDocument(base, []);
    expect(updated.shapes.size).toBe(2);
  });
});

describe('Document.hasShape', () => {
  let base: DocumentModel;

  beforeEach(() => {
    base = Document.addShapesToDocument(Document.createNewDocument('Doc'), [makeShape('exists')]);
  });

  it('returns true for a shape that exists', () => {
    expect(Document.hasShape(base, 'exists')).toBe(true);
  });

  it('returns false for a shape that does not exist', () => {
    expect(Document.hasShape(base, 'missing')).toBe(false);
  });
});

describe('Document.getShapeById', () => {
  let base: DocumentModel;
  const shape = makeShape('target');

  beforeEach(() => {
    base = Document.addShapesToDocument(Document.createNewDocument('Doc'), [shape]);
  });

  it('returns the correct shape when it exists', () => {
    const result = Document.getShapeById(base, 'target');
    expect(result).toEqual(shape);
  });

  it('throws when the shape does not exist', () => {
    expect(() => Document.getShapeById(base, 'ghost')).toThrow(
      'Shape with ID ghost not found in document.',
    );
  });
});
