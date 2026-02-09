import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      compileTypst: (source: string) => Promise<string>;

      pdf: {
        pick: () => Promise<{ filePath: string; name: string } | null>;
      };
    };
  }
}
