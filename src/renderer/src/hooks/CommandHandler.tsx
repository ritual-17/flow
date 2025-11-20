import { useCanvas } from '@renderer/context/CanvasContext'
import { useSelection } from '@renderer/context/Hooks'
import { useState } from 'react'

export const useCommandHandler = () => {
  const { cursorPosition, setCursorPosition, gridSize, setGridSize, setShapes } = useCanvas()
  const [currentCommand, setCurrentCommand] = useState<string[]>([])

  const { selectClosestShape, selectedShapeIds, setSelectedShapeIds } = useSelection()
  const [isTxtFocus, setIsTxtFocus] = useState<boolean>(false);

  const handleCommandKey = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    let { x, y } = cursorPosition
    const step = gridSize
    //if use is in a text box dont read inputs
    if (isTxtFocus){
      if (e.key === 'Tab'){
        //unFocusTxt()
        setIsTxtFocus(false)
      } else {
        return
      }
    }
    setCurrentCommand([])
    switch (e.key) {
      case 'h':
        moveShape(-step, 0)
        x -= step
        setCursorPosition({ x, y })
        break
      case 'l':
        moveShape(step, 0)
        x += step
        setCursorPosition({ x, y })
        break
      case 'j':
        moveShape(0, step)
        y += step
        setCursorPosition({ x, y })
        break
      case 'k':
        moveShape(0, -step)
        y -= step
        setCursorPosition({ x, y })
        break
      case 'I': {
        const newGridSize = gridSize + 5
        setGridSize(newGridSize)
        return
      }
      case 'O': {
        const decreasedGridSize = Math.max(5, gridSize - 5)
        setGridSize(decreasedGridSize)
        return
      }
      case ']':
        resizeShape(5)
        return
      case '[':
        resizeShape(-5)
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
        setSelectedShapeIds(new Set())
        return
      case 's':
        setCurrentCommand(() => ['s'])
        selectClosestShape()

        return
      case 'd':
        setShapes((prevShapes) => prevShapes.filter((shape) => !selectedShapeIds.has(shape.id)))
        return
      case 'f':
        setCurrentCommand(() => ['f'])
        focusTxt()
        return
      case '}':
        rotateShape(15)
        return
      case '{':
        rotateShape(-15)
        return
      default:
        return
    }
  }

  const moveShape = (deltaX: number, deltaY: number) => {
    if (selectedShapeIds.size === 0) return

    const id = Array.from(selectedShapeIds)[0]
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === id
          ? {
              ...shape,
              position: {
                x: shape.position.x + deltaX,
                y: shape.position.y + deltaY
              }
            }
          : shape
      )
    )
  }

  const resizeShape = (deltaSize: number) => {
    if (selectedShapeIds.size === 0) return

    const id = Array.from(selectedShapeIds)[0]
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === id
          ? {
              ...shape,
              size: Math.max(5, shape.size + deltaSize)
            }
          : shape
      )
    )
  }

  const rotateShape = (deltaRotation: number) => {
    if (selectedShapeIds.size === 0) return

    const id = Array.from(selectedShapeIds)[0]
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === id
          ? {
              ...shape,
              rotation: (shape.rotation || 0) + deltaRotation
            }
          : shape
      )
    )
  }

  //code for focusing on  text boxes to write text.
  const focusTxt = () => {
    const id = Array.from(selectedShapeIds)[0]
    window.setTimeout(function () {
      const textarea = document.querySelector<HTMLTextAreaElement>(`#${id}`);
      if (textarea != null) {
        textarea.focus()
        textarea.select()
        setIsTxtFocus(true)
      }
    }, 0);
  }
  // the unfocsuing was not working so we are using tab istead to cycle bck to the canvas
  // const unFocusTxt = () => {
  //   const id = Array.from(selectedShapeIds)[0]
  //   window.setTimeout(function () {
  //     const textarea = document.querySelector<HTMLTextAreaElement>(`#${id}`);
  //     if (textarea != null) {
  //       textarea.blur()
  //       const canvas = document.getElementById('Canvas')
  //       window.setTimeout(function () {  
  //         canvas?.focus()
  //         setIsTxtFocus(false)
  //       }, 0);
  //     }
  //   }, 0);
  //}

  return { handleCommandKey, currentCommand }
}

// replace this with uuid v4 generator in the future
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
