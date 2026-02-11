import { setCursorPosition } from '@renderer/core/editor/Editor';
import { Canvas } from '@renderer/ui/components/Canvas';
import { KeyboardHandler } from '@renderer/ui/components/KeyboardHandler';
import { StatusBar } from '@renderer/ui/components/StatusBar';
import { useStore } from '@renderer/ui/Store';
import React from 'react';

const STATUS_BAR_HEIGHT = 24;

function App(): React.JSX.Element {
  const [windowSize, setWindowSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  React.useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    const { editor, updateEditor } = useStore.getState();

    updateEditor(
      setCursorPosition(editor, {
        x: window.innerWidth / 2,
        y: (window.innerHeight - STATUS_BAR_HEIGHT) / 2,
      }),
    );

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className='flex flex-col h-screen w-screen bg-[#1e1f22] text-gray-300 font-mono overflow-hidden'>
      <Canvas
        width={windowSize.width - STATUS_BAR_HEIGHT}
        height={windowSize.height - STATUS_BAR_HEIGHT}
      />
      <StatusBar />
      <KeyboardHandler />
    </div>
  );
}

export default App;
