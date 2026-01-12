// Maps command name to handler
//

import { addShapeToDocument } from '@renderer/core/commands/ManipulationCommands';

function commandFromName(command: string): Function {
  switch (command) {
    case 'addShape':
      return addShapeToDocument;
  }
}
export { commandFromName };
