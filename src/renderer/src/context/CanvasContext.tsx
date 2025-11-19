import { Point, Shape } from '@renderer/types/types'
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
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const [cursorPosition, setCursorPosition] = useState<Point>({ x: 300, y: 200 })

  const [gridSize, setGridSize] = useState<number>(20)

  const [shapes, setShapes] = useState<Shape[]>([])

  const updateGridSize = (size: number): void => {
    setGridSize(size)
    snapCursorToGrid(cursorPosition, size)
  }

  const snapCursorToGrid = ({ x, y }: Point, gridSize?: number): void => {
    let newX = x
    let newY = y

    if (gridSize) {
      const diffX = x % gridSize
      if (diffX < gridSize / 2) {
        newX -= diffX
      } else {
        newX += gridSize - diffX
      }

      const diffY = y % gridSize
      if (diffY < gridSize / 2) {
        newY -= diffY
      } else {
        newY += gridSize - diffY
      }
    }

    setCursorPosition({ x: newX, y: newY })
  }
  return (
    <CanvasContext.Provider
      value={{
        cursorPosition,
        setCursorPosition: snapCursorToGrid,
        gridSize,
        setGridSize: updateGridSize,
        shapes,
        setShapes
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
