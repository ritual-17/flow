import Canvas from '@renderer/components/canvas/Canvas'
import { CanvasProvider } from '@renderer/context/CanvasContext'
import React, { useState, MouseEvent, useEffect } from 'react'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <CanvasProvider>
        <Canvas />
      </CanvasProvider>
    </>
  )
}

export default App
