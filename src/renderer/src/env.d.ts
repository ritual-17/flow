/// <reference types="vite/client" />

export {};

type SaveArgs = { contents: string; filePath?: string | null };
type SaveResult = { filePath: string | null };
type OpenResult = { filePath: string; contents: string } | null;

declare global {
  interface Window {
    api: {
      flowFS: {
        open: () => Promise<OpenResult>;
        save: (args: SaveArgs) => Promise<SaveResult>;
      };
    };
  }
}
