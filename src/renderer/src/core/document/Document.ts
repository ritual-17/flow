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

function updateShapesInDocument(document: DocumentModel, updatedShapes: Shape[]): DocumentModel {
  return produce(document, (draft) => {
    updatedShapes.forEach((shape) => {
      if (draft.shapes.has(shape.id)) {
        draft.shapes.set(shape.id, shape);
      }
    });
  });
}

export {
  createNewDocument,
  updateDocumentMetadata,
  addShapesToDocument,
  removeShapesFromDocument,
  updateShapesInDocument,
};
