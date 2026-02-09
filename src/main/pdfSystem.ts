// This module opens the OS file picker dialog to select a PDF file and returns { filepath, name }

import { dialog } from 'electron';

export async function pickPdfFile(): Promise<{ filePath: string; name: string } | null> {
  const result = await dialog.showOpenDialog({
    title: 'Import PDF',
    properties: ['openFile'],
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const filePath = result.filePaths[0];
  const name = filePath.split(/[\\/]/).pop() ?? 'document.pdf';
  return { filePath, name };
}
