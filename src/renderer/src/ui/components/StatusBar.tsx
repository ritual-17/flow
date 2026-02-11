// components/StatusBar.tsx
import { useStore } from '@renderer/ui/Store';

// just visual for showing current mode, cursor position, shape count, etc.
export function StatusBar() {
  const mode = useStore((state) => state.editor.mode);
  const cursor = useStore((state) => state.editor.cursorPosition);
  const shapeCount = useStore((state) => state.document.shapes.size);
  const isSaved = useStore((state) => state.document.metadata.isSaved);
  const documentName = useStore((state) => state.document.metadata.name);
  const commandBuffer = useStore((state) => state.editor.commandBuffer);
  const statusMessage = useStore((state) => state.editor.statusMessage);

  const getModeDisplay = () => {
    switch (mode) {
      case 'normal':
        return 'NORMAL';
      case 'insert':
        return 'INSERT';
      case 'visual':
        return 'VISUAL';
      case 'command':
        return 'COMMAND';
      default:
        return mode.toUpperCase();
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'normal':
        return 'text-blue-400';
      case 'insert':
        return 'text-teal-400';
      case 'visual':
        return 'text-purple-400';
      case 'command':
        return 'text-yellow-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className='flex gap-4 bg-blue-600 text-white px-3 py-0 text-sm leading-none items-center h-[40px]'>
      <div className='flex items-center gap-2'>
        <span className={`font-bold min-w-[60px] ${getModeColor()}`}>{getModeDisplay()}</span>
      </div>

      <div className='flex items-center gap-2'>
        <span className='opacity-90'>
          {documentName}
          {!isSaved && ' [+]'}
        </span>
      </div>

      <div className='flex items-center gap-2'>
        <span className='opacity-80 font-mono'>{shapeCount} shapes</span>
      </div>

      <div className='flex items-center gap-2'>
        <span className='opacity-80 font-mono'>
          {Math.round(cursor.x)}, {Math.round(cursor.y)}
        </span>
      </div>

      <div className='flex items-center gap-2'>
        <span className='opacity-80 font-mono'>{commandBuffer}</span>
      </div>

      <div className='flex items-center gap-2'>
        <span className='opacity-80 font-mono'>{statusMessage ?? ''}</span>
      </div>
    </div>
  );
}
