import { useCanvas } from '@renderer/context/CanvasContext'

export const useCommandHandler = () => {
  const { cursorPosition, setCursorPosition, gridSize, setGridSize, setShapes } = useCanvas()

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
      case '+':
        const newGridSize = gridSize + 5
        setGridSize(newGridSize)
        return
      case '-':
        const decreasedGridSize = Math.max(5, gridSize - 5)
        setGridSize(decreasedGridSize)
        return
      case 'c':
        setShapes((prev) => [...prev, { type: 'circle', position: { x, y }, size: gridSize }])
        return
      case 'r':
        setShapes((prev) => [...prev, { type: 'rectangle', position: { x, y }, size: gridSize }])
        return
      case 't':
        setShapes((prev) => [...prev, { type: 'text-box', position: { x, y }, size: gridSize }])
        return
      case 'p':
        setShapes((prev) => [...prev, { type: 'triangle', position: { x, y }, size: gridSize }])
        return
      default:
        return
    }
  }

  return { handleCommandKey }
}
