import { Point, Mode, Shape, Line } from '@renderer/types/types'
import React, { createContext, useContext, useState, ReactNode } from 'react'

/*
 * This is global context for the app. Hopefully we will split this into smaller contexts later.
 */

interface CanvasContextType {
  cursorPosition: Point
  setCursorPosition: (position: Point) => void
  gridSize: number
  setGridSize: (size: number) => void
  shapes: Shape[]
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>
  lines: Line[]
  setLines: React.Dispatch<React.SetStateAction<Line[]>>
  mode: Mode
  setMode: React.Dispatch<React.SetStateAction<Mode>>

}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const [cursorPosition, setCursorPosition] = useState<Point>({ x: 300, y: 200 })

  const [gridSize, setGridSize] = useState<number>(20)

  const [shapes, setShapes] = useState<Shape[]>([])

  const [lines, setLines] = useState<Line[]>([])

  const [mode, setMode] = useState<Mode>('shape') //Setting shapes to default mode, can change later

  const updateGridSize = (size: number): void => {
    setGridSize(size)
    snapCursorToGrid(cursorPosition, size)
  }

  const snapCursorToGrid = ({ x, y }: Point, gridSize?: number): void => {
    if (gridSize) {
      const diffX = x % gridSize
      if (diffX < gridSize / 2) {
        x -= diffX
      } else {
        x += gridSize - diffX
      }

      const diffY = y % gridSize
      if (diffY < gridSize / 2) {
        y -= diffY
      } else {
        y += gridSize - diffY
      }
    }

    setCursorPosition({ x, y })
  }
  return (
    <CanvasContext.Provider
      value={{
        cursorPosition,
        setCursorPosition: snapCursorToGrid,
        gridSize,
        setGridSize: updateGridSize,
        shapes,
        setShapes,
        lines,
        setLines,
        mode,
        setMode
      }}
    >
      {children}
    </CanvasContext.Provider>
  )
}

export const useCanvas = () => {
  const context = useContext(CanvasContext)
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider')
  }
  return context
}
