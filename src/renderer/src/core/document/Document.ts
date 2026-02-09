// Document model: metadata + shapes
//
// Contains the in-memory information of a working document such as:
// - metadata: document name, last edited, path
// - shapes: shape info
//
import { Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { produce } from 'immer';

export interface DocumentMetadata {
  name: string;
  lastEdited: Date;
  isSaved: boolean;
  path: string | null;
}

export interface DocumentModel {
  metadata: DocumentMetadata;
  shapes: Map<ShapeId, Shape>;
}

function createNewDocument(name: string): DocumentModel {
  return {
    metadata: {
      name,
      lastEdited: new Date(),
      isSaved: false,
      path: null,
    },
    shapes: new Map<ShapeId, Shape>(),
  };
}

function updateDocumentMetadata(
  document: DocumentModel,
  updates: Partial<DocumentMetadata>,
): DocumentModel {
  return produce(document, (draft) => {
    Object.assign(draft.metadata, updates);
  });
}

function addShapesToDocument(document: DocumentModel, shapes: Shape[]): DocumentModel {
  return produce(document, (draft) => {
    shapes.forEach((shape) => draft.shapes.set(shape.id, shape));
  });
}

function removeShapesFromDocument(document: DocumentModel, shapeIds: ShapeId[]): DocumentModel {
  return produce(document, (draft) => {
    shapeIds.forEach((shapeIds) => draft.shapes.delete(shapeIds));
  });
}

// helper function to update multiple shapes in the document to be used in other places
// this is so everything stays immutable. see translateSelection in ManipulationCommands.ts for
// example usage.
function updateShapesInDocument(document: DocumentModel, updatedShapes: Shape[]): DocumentModel {
  return produce(document, (draft) => {
    updatedShapes.forEach((shape) => {
      if (draft.shapes.has(shape.id)) {
        draft.shapes.set(shape.id, shape);
      }
    });
  });
}

function hasShape(document: DocumentModel, shapeId: ShapeId): boolean {
  return document.shapes.has(shapeId);
}

// Helper function to get a shape by ID that assumes it exists
function getShapeById(document: DocumentModel, shapeId: ShapeId): Shape {
  const shape = document.shapes.get(shapeId);
  if (!shape) {
    throw new Error(`Shape with ID ${shapeId} not found in document.`);
  }

  return shape;
}

export const Document = {
  createNewDocument,
  updateDocumentMetadata,
  addShapesToDocument,
  removeShapesFromDocument,
  updateShapesInDocument,
  hasShape,
  getShapeById,
};
