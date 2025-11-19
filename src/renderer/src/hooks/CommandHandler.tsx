import { useCanvas } from '@renderer/context/CanvasContext'
import { useSelection } from '@renderer/context/Hooks'
import { useState } from 'react'

export const useCommandHandler = () => {
  const { cursorPosition, setCursorPosition, gridSize, setGridSize, setShapes } = useCanvas()
  const [currentCommand, setCurrentCommand] = useState<string[]>([])

  const { selectClosestShape } = useSelection()

  const handleCommandKey = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    let { x, y } = cursorPosition
    const step = gridSize

    switch (e.key) {
      case 'h':
        x -= step
        setCursorPosition({ x, y })
        break
      case 'l':
        x += step
        setCursorPosition({ x, y })
        break
      case 'j':
        y += step
        setCursorPosition({ x, y })
        break
      case 'k':
        y -= step
        setCursorPosition({ x, y })
        break
      case ']':
        const newGridSize = gridSize + 5
        setGridSize(newGridSize)
        return
      case '[':
        const decreasedGridSize = Math.max(5, gridSize - 5)
        setGridSize(decreasedGridSize)
        return
      case 'c':
        setShapes((prev) => [
          ...prev,
          { id: generateId(), type: 'circle', position: { x, y }, size: gridSize }
        ])
        return
      case 'r':
        setShapes((prev) => [
          ...prev,
          { id: generateId(), type: 'rectangle', position: { x, y }, size: gridSize }
        ])
        return
      case 't':
        setShapes((prev) => [
          ...prev,
          { id: generateId(), type: 'text-box', position: { x, y }, size: gridSize }
        ])
        return
      case 'p':
        setShapes((prev) => [
          ...prev,
          { id: generateId(), type: 'triangle', position: { x, y }, size: gridSize }
        ])
        return
      case 'Escape':
        setCurrentCommand([])
        return
      case 's':
        setCurrentCommand((prev) => [...prev, 's'])
        selectClosestShape()
        return
      default:
        return
    }
  }

  return { handleCommandKey }
}

// replace this with uuid v4 generator in the future
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
