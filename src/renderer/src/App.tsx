import { Canvas } from '@renderer/ui/components/Canvas';
import { KeyboardHandler } from '@renderer/ui/components/KeyboardHandler';
import { StatusBar } from '@renderer/ui/components/StatusBar';
import React from 'react';

function App(): React.JSX.Element {
  return (
    <div className='flex flex-col h-screen w-screen bg-gray-900 text-gray-300 font-mono overflow-hidden'>
      <Canvas />
      <StatusBar />
      <KeyboardHandler />
    </div>
  );
}

export default App;
