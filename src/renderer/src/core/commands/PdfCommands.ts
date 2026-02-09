import type { CommandArgs, CommandResult } from '@renderer/core/commands/CommandRegistry';
import { Document } from '@renderer/core/document/Document';
import { importPdfFromPicker } from '@renderer/core/pdf/ImportPdf';

export async function importPdf(args: CommandArgs): Promise<CommandResult> {
  const { editor, document } = args;

  const result = await importPdfFromPicker();
  if (!result) return [editor, document];

  let updatedDocument = Document.addPdfSource(document, result.source);
  updatedDocument = Document.addPdfSlides(updatedDocument, result.slides);

  return [editor, updatedDocument];
}
