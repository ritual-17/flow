import Canvas from '@renderer/components/canvas/Canvas'
import { CanvasProvider } from '@renderer/context/CanvasContext'
import { SelectionProvider } from '@renderer/context/SelectionContext'
import React from 'react'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <CanvasProvider>
        <SelectionProvider>
          <Canvas />
        </SelectionProvider>
      </CanvasProvider>
    </>
  )
}

export default App
