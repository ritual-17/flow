import type { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import { exportToPdf } from '@renderer/core/pdf/ExportPdf';
import { generatePdfSlides } from '@renderer/core/pdf/ImportPdf';

import { addShapesToDocument } from './ManipulationCommands';

export async function importPdf(args: CommandArgs): Promise<CommandResult> {
  const { editor, document } = args;

  const pdfSlides = await generatePdfSlides();
  if (!pdfSlides) return [editor, document];

  const updatedDocument = addShapesToDocument(args, pdfSlides);

  return [editor, updatedDocument];
}

export async function exportPdf(args: CommandArgs): Promise<CommandResult> {
  const { editor, document } = args;
  await exportToPdf(document);
  return [editor, document];
}
