import Cursor from '@renderer/components/canvas/Cursor'
import Grid from '@renderer/components/canvas/Grid'
import ShapesDisplay from '@renderer/components/shapes/ShapesDisplay'
import LinesDisplay from '@renderer/components/customGeometry/LinesDisplay'
import { useCanvas } from '@renderer/context/CanvasContext'
import { useCommandHandler } from '@renderer/hooks/CommandHandler'
import React, { useEffect } from 'react'

const Canvas: React.FC = () => {
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight
  const { gridSize, mode } = useCanvas()

  const canvasRef = React.useRef<HTMLDivElement | null>(null)

  const { handleCommandKey } = useCommandHandler()

  useEffect(() => {
    // this focuses the div so it can receive keyboard events
    canvasRef.current?.focus()
  }, [])

  return (
    <div
      className="flex justify-center items-center bg-green-50 h-screen w-full"
      ref={canvasRef}
      tabIndex={0}
      onKeyDown={handleCommandKey}
    >
      <Grid gridSize={gridSize} height={height} width={width} />
      <Cursor />
      <ShapesDisplay />
      <LinesDisplay />
      <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 text-white text-sm rounded"
        >
          Mode: {mode === 'shape' ? 'Shape' : mode === 'line' ? 'Line' : 'Arrow'}
      </div>
    </div>
  )
}

export default Canvas
