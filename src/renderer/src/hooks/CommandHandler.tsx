import { useCanvas } from '@renderer/context/CanvasContext'
import React, { useState } from 'react'
import { Point } from '@renderer/types/types'
import { useSelection } from '@renderer/context/Hooks'
        
export const useCommandHandler = () => {
  const { cursorPosition, setCursorPosition, gridSize, setGridSize, setShapes, setLines, setMode, mode } = useCanvas()

  const [lineStart, setLineStart,] = useState<Point>({ x: 0, y: 0 })
  const [isLineStartSet, setIsLineStartSet] = useState<boolean>(false);
  // const [lineEnd, setLineEnd,] = useState<Point>({ x: 0, y: 0 })
  const [isLineEndSet, setIsLineEndSet] = useState<boolean>(false);
  const { selectClosestShape, selectedShapeIds, setSelectedShapeIds } = useSelection()
  const [currentCommand, setCurrentCommand] = useState<string[]>([])
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
        if (mode === 'shape'){
          setShapes((prev) => [
          ...prev,
          { id: generateId(), type: 'circle', position: { x, y }, size: gridSize }
        ])
        }
        return
      case 'r':
        if (mode === 'shape') {
          setShapes((prev) => [
          ...prev,
          { id: generateId(), type: 'rectangle', position: { x, y }, size: gridSize }
        ])
        }
        return
      case 't':
        if (mode === 'shape') {
          setShapes((prev) => [
          ...prev,
          { id: generateId(), type: 'text-box', position: { x, y }, size: gridSize }
        ])
        }
        return
      case 'p':
        if (mode === 'shape') {
          setShapes((prev) => [
          ...prev,
          { id: generateId(), type: 'triangle', position: { x, y }, size: gridSize }
        ])
        }
        return
      case 'g':
        if (mode === 'shape' || mode === 'arrow'){
          setMode('line')
        }
        
        else if(mode === 'line'){
          if(!isLineStartSet){
            setLineStart(cursorPosition)
            setIsLineStartSet(true)
          }
          else if (lineStart.x === cursorPosition.x && lineStart.y === cursorPosition.y){
            setIsLineStartSet(false)
            setIsLineEndSet(false)
            setMode('shape')
          }
          else if (isLineStartSet){
            const start = lineStart
            const end = cursorPosition
  
            // setLineEnd(cursorPosition)
            // setIsLineEndSet(true)
            //const newLine = {type: 'line', position1: lineStart, position2: lineEnd, size: gridSize}
            setLines((prev) => [...prev, {type: 'line', position1: start, position2: end, size: gridSize}])
            setLineStart(end)
            setIsLineStartSet(true)
            // setIsLineEndSet(false)
          }
          /*
          Custom Geometry:
          - Pressing the first G key will enter the line mode state
          - Pressing the second G again will place the start of the line
          - Any subsequent Gs will place the end lines
              - If G is pressed as a subsequent G without moving the cursor,  user will exist line mode
  
              Last Modified:
                  11/13/2025 - Jeffrey and Hussain
          */
  
  
        }
        return

      case 'a':
        if (mode === 'shape' || mode === 'line'){
          setMode('arrow')
        }
        else if(mode === 'arrow'){
          if(!isLineStartSet){
            setLineStart(cursorPosition)
            setIsLineStartSet(true)
          }
          else if (lineStart.x === cursorPosition.x && lineStart.y === cursorPosition.y){
            setIsLineStartSet(false)
            setIsLineEndSet(false)
            setMode('shape')
          }
          else if (isLineStartSet){
            const start = lineStart
            const end = cursorPosition

            // setLineEnd(cursorPosition)
            // setIsLineEndSet(true)
            //const newLine = {type: 'line', position1: lineStart, position2: lineEnd, size: gridSize}
            setLines((prev) => [...prev, {type: 'arrow', position1: start, position2: end, size: gridSize}])
            setLineStart(end)
            setIsLineStartSet(true)
            // setIsLineEndSet(false)
          }
          /*
          Custom Geometry:
          - Pressing the first G key will enter the line mode state
          - Pressing the second G again will place the start of the line
          - Any subsequent Gs will place the end lines
              - If G is pressed as a subsequent G without moving the cursor,  user will exist line mode

              Last Modified:
                  11/13/2025 - Jeffrey and Hussain
          */
        } 
      case 'Escape':
        setCurrentCommand([])
        setSelectedShapeIds(new Set())
        setMode('shape')
        setIsLineStartSet(false)
        setIsLineEndSet(false)
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
