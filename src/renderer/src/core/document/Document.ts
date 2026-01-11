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
  return produce(document, (draft) => {
    Object.assign(draft.metadata, updates);
  });
}

function addShapesToDocument(document: DocumentModel, shapes: Shape[]): DocumentModel {
  return produce(document, (draft) => {
    draft.shapes.push(...shapes);
  });
}

function removeShapesFromDocument(document: DocumentModel, shapeIds: ShapeId[]): DocumentModel {
  return produce(document, (draft) => {
    const idsToRemove = new Set(shapeIds);
    draft.shapes = draft.shapes.filter((shape) => !idsToRemove.has(shape.id));
  });
}

function updateShapesInDocument(document: DocumentModel, updatedShapes: Shape[]): DocumentModel {
  return produce(document, (draft) => {
    const shapeMap = new Map(updatedShapes.map((s) => [s.id, s]));

    for (let i = 0; i < draft.shapes.length; i++) {
      const updated = shapeMap.get(draft.shapes[i].id);
      if (updated) {
        draft.shapes[i] = updated;
      }
    }
  });
}

export {
  createNewDocument,
  updateDocumentMetadata,
  addShapesToDocument,
  removeShapesFromDocument,
  updateShapesInDocument,
};
