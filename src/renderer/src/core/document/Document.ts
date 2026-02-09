// Document model: metadata + shapes
//
// Contains the in-memory information of a working document such as:
// - metadata: document name, last edited, path
// - shapes: shape info
//
import { PdfId, PdfSlide, PdfSlideId, PdfSource } from '@renderer/core/document/Pdf';
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
  pdfSources: Map<PdfId, PdfSource>;
  pdfSlides: Map<PdfSlideId, PdfSlide>;
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
    pdfSources: new Map<PdfId, PdfSource>(),
    pdfSlides: new Map<PdfSlideId, PdfSlide>(),
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

// PDF helper functions
function addPdfSource(document: DocumentModel, source: PdfSource): DocumentModel {
  return produce(document, (draft) => {
    draft.pdfSources.set(source.id, source);
  });
}

function addPdfSlides(document: DocumentModel, slides: PdfSlide[]): DocumentModel {
  return produce(document, (draft) => {
    slides.forEach((s) => draft.pdfSlides.set(s.id, s));
  });
}

function updatePdfSlide(document: DocumentModel, slide: PdfSlide): DocumentModel {
  return produce(document, (draft) => {
    if (draft.pdfSlides.has(slide.id)) {
      draft.pdfSlides.set(slide.id, slide);
    }
  });
}

function removePdfSlides(document: DocumentModel, slideIds: PdfSlideId[]): DocumentModel {
  return produce(document, (draft) => {
    slideIds.forEach((id) => draft.pdfSlides.delete(id));
  });
}

export const Document = {
  createNewDocument,
  updateDocumentMetadata,
  addShapesToDocument,
  removeShapesFromDocument,
  updateShapesInDocument,
  hasShape,
  getShapeById,
  addPdfSource,
  addPdfSlides,
  updatePdfSlide,
  removePdfSlides,
};
