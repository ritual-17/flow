import { Canvas } from '@renderer/ui/components/Canvas';
import { KeyboardHandler } from '@renderer/ui/components/KeyboardHandler';
import { StatusBar } from '@renderer/ui/components/StatusBar';
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

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className='flex flex-col h-screen w-screen bg-gray-900 text-gray-300 font-mono overflow-hidden'>
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
