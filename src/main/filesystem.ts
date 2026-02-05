// src/main/fileSystem.ts
import { app, dialog } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';

const FLOW_DIR_NAME = 'flow';
const FLOW_EXTENSION = '.flow.json';

/**
 * Default location: $HOME/Documents/flow/
 */
export async function getDefaultFlowDir(): Promise<string> {
  const documentsDir = app.getPath('documents');
  const flowDir = path.join(documentsDir, FLOW_DIR_NAME);
  await fs.mkdir(flowDir, { recursive: true });
  return flowDir;
}

function ensureExtension(filePath: string): string {
  return filePath.endsWith(FLOW_EXTENSION) ? filePath : `${filePath}${FLOW_EXTENSION}`;
}

async function writeFileAtomic(targetPath: string, contents: string): Promise<void> {
  const dir = path.dirname(targetPath);
  await fs.mkdir(dir, { recursive: true });

  const tmpPath = `${targetPath}.tmp`;
  await fs.writeFile(tmpPath, contents, 'utf-8');
  await fs.rename(tmpPath, targetPath);
}

/**
 * Save Flow file. If filePath is not provided, opens Save dialog.
 * Returns final saved filePath, or null if user cancelled.
 */
export async function saveFlowFile(args: {
  contents: string;
  filePath?: string | null;
}): Promise<{ filePath: string | null }> {
  const defaultDir = await getDefaultFlowDir();

  // Case 1: Save to existing path
  if (args.filePath) {
    const finalPath = ensureExtension(args.filePath);
    await writeFileAtomic(finalPath, args.contents);
    return { filePath: finalPath };
  }

  // Case 2: Ask user where to save (no owner window needed; avoids BaseWindow typing issues)
  const result = await dialog.showSaveDialog({
    title: 'Save Flow File',
    defaultPath: path.join(defaultDir, `untitled${FLOW_EXTENSION}`),
    filters: [{ name: 'Flow Files', extensions: ['json'] }],
  });

  if (result.canceled || !result.filePath) {
    return { filePath: null };
  }

  const finalPath = ensureExtension(result.filePath);
  await writeFileAtomic(finalPath, args.contents);
  return { filePath: finalPath };
}

/**
 * Open Flow file using Open dialog.
 * Returns { filePath, contents } or null if user cancelled.
 */
export async function openFlowFile(): Promise<{ filePath: string; contents: string } | null> {
  const defaultDir = await getDefaultFlowDir();

  const result = await dialog.showOpenDialog({
    title: 'Open Flow File',
    defaultPath: defaultDir,
    properties: ['openFile'],
    filters: [{ name: 'Flow Files', extensions: ['json'] }],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const contents = await fs.readFile(filePath, 'utf-8');
  return { filePath, contents };
}

/**
 * Create a default new file path inside the default Flow folder.
 * (Use after you prompt user for a name; does not write anything.)
 */
export async function getNewFlowFilePath(fileName: string): Promise<string> {
  const defaultDir = await getDefaultFlowDir();
  const base = fileName.trim() || 'untitled';
  return path.join(defaultDir, ensureExtension(base));
}
