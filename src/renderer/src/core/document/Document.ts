// Document model: metadata + shapes
//
// Contains the in-memory information of a working document such as:
// - metadata: document name, last edited, path
// - shapes: shape info
//

import { Shape, ShapeId } from '@renderer/core/geometry/Shape';

export interface DocumentMetadata {
  name: string;
  lastEdited: Date;
  isSaved: boolean;
  path: string | null;
}

export interface DocumentModel {
  metadata: DocumentMetadata;
  shapes: Shape[];
}

function createNewDocument(name: string): DocumentModel {
  return {
    metadata: {
      name,
      lastEdited: new Date(),
      isSaved: false,
      path: null,
    },
    shapes: [],
  };
}

function updateDocumentMetadata(
  document: DocumentModel,
  updates: Partial<DocumentMetadata>,
): DocumentModel {
  return {
    ...document,
    metadata: {
      ...document.metadata,
      ...updates,
    },
  };
}

function addShapesToDocument(document: DocumentModel, shapes: Shape[]): DocumentModel {
  return {
    ...document,
    shapes: [...document.shapes, ...shapes],
  };
}

function removeShapesFromDocument(document: DocumentModel, shapeIds: ShapeId[]): DocumentModel {
  const idsToRemove = new Set(shapeIds);

  return {
    ...document,
    shapes: document.shapes.filter((shape) => !idsToRemove.has(shape.id)),
  };
}

function updateShapesInDocument(document: DocumentModel, updatedShapes: Shape[]): DocumentModel {
  const shapeMap = new Map<ShapeId, Shape>();
  updatedShapes.forEach((shape) => shapeMap.set(shape.id, shape));

  return {
    ...document,
    shapes: document.shapes.map((shape) => shapeMap.get(shape.id) || shape),
  };
}

export {
  createNewDocument,
  updateDocumentMetadata,
  addShapesToDocument,
  removeShapesFromDocument,
  updateShapesInDocument,
};
