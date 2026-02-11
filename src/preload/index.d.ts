import { ElectronAPI } from '@electron-toolkit/preload';

import { LoadedPdfFile } from './pdfSystem';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      compileTypst: (source: string) => Promise<string>;

      pdf: {
        pick: () => Promise<LoadedPdfFile | null>;
      };
    };
  }
}
