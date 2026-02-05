import { Shape } from '@renderer/core/geometry/Shape';

export type FlowFileV1 = {
  version: 1;
  metadata: {
    name: string;
    lastEditedISO: string;
    // path is not always portable; store if you want
    path: string | null;
  };
  shapes: Shape[];
  editor?: {
    cursorPosition: { x: number; y: number }; // location of cursor in editor
  };
};

export type FlowFile = FlowFileV1;
