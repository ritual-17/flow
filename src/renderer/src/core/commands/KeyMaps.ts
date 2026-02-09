import { Mode } from '@renderer/core/editor/Editor';

export type KeyMaps = {
  [K in Mode]: KeyMap;
};

export interface KeyMap {
  [keys: string]: string;
}



