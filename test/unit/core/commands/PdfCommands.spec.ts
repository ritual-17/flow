/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ManipulationCommands from '@renderer/core/commands/ManipulationCommands';
import { importPdf } from '@renderer/core/commands/PdfCommands';
import * as ImportPdf from '@renderer/core/pdf/ImportPdf';

jest.mock('@renderer/core/pdf/ImportPdf', () => ({
  generatePdfSlides: jest.fn(),
}));

jest.mock('@renderer/core/commands/ManipulationCommands', () => ({
  addShapesToDocument: jest.fn(),
}));

describe('importPdf command', () => {
  let mockEditor: any;
  let mockDocument: any;
  let mockArgs: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockEditor = { mode: 'normal' };
    mockDocument = { shapes: [] };

    mockArgs = {
      editor: mockEditor,
      document: mockDocument,
    };
  });

  it('should return original editor and document if PDF import is cancelled', async () => {
    (ImportPdf.generatePdfSlides as jest.Mock).mockResolvedValue(null);

    const result = await importPdf(mockArgs);

    expect(ImportPdf.generatePdfSlides).toHaveBeenCalled();
    expect(result).toEqual([mockEditor, mockDocument]);
  });

  it('should add generated PDF slides to the document', async () => {
    const mockSlides = [
      { id: 'slide1', type: 'pdf' },
      { id: 'slide2', type: 'pdf' },
    ];

    const updatedDocument = { shapes: mockSlides };

    (ImportPdf.generatePdfSlides as jest.Mock).mockResolvedValue(mockSlides);
    (ManipulationCommands.addShapesToDocument as jest.Mock).mockReturnValue(updatedDocument);

    const result = await importPdf(mockArgs);

    expect(ImportPdf.generatePdfSlides).toHaveBeenCalled();
    expect(ManipulationCommands.addShapesToDocument).toHaveBeenCalledWith(mockArgs, mockSlides);
    expect(result).toEqual([mockEditor, updatedDocument]);
  });
  it('should not call addShapesToDocument if no PDF slides are returned', async () => {
    (ImportPdf.generatePdfSlides as jest.Mock).mockResolvedValue(null);

    await importPdf(mockArgs);

    expect(ManipulationCommands.addShapesToDocument).not.toHaveBeenCalled();
  });
});
