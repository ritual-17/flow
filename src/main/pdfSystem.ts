// This module opens the OS file picker dialog to select a PDF file and returns { filepath, name }

import { dialog } from 'electron';
import fs from 'fs';

export type LoadedPdfFile = {
  filePath: string;
  name: string;
  data: Buffer;
};

export async function pickPdfFile(): Promise<LoadedPdfFile | null> {
  const result = await dialog.showOpenDialog({
    title: 'Import PDF',
    properties: ['openFile'],
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const filePath = result.filePaths[0];
  const name = filePath.split(/[\\/]/).pop() ?? 'document.pdf';
  const data = fs.readFileSync(filePath);

  return { filePath, name, data };
}
