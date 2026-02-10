import type { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import { generatePdfSlides } from '@renderer/core/pdf/ImportPdf';

import { addShapesToDocument } from './ManipulationCommands';

export async function importPdf(args: CommandArgs): Promise<CommandResult> {
  const { editor, document } = args;

  const pdfSlides = await generatePdfSlides();
  if (!pdfSlides) return [editor, document];

  // TODO: add pdf results to shapes instead of pdf fields
  const updatedDocument = addShapesToDocument(args, pdfSlides);

  return [editor, updatedDocument];
}
