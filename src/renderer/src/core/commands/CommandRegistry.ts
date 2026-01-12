// Maps command name to handler
//

import { addShapeToDocument } from '@renderer/core/commands/ManipulationCommands';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function commandFromName(command: string): Function | null {
  switch (command) {
    case 'addShape':
      return addShapeToDocument;
    default:
      return null;
  }
}
export { commandFromName };
