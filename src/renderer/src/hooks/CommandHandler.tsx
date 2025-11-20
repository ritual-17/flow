import { useCanvas } from '@renderer/context/CanvasContext'
import React, { useState } from 'react'
import { Point } from '@renderer/types/types'

export const useCommandHandler = () => {
  const { cursorPosition, setCursorPosition, gridSize, setGridSize, setShapes, setLines, setMode, mode } = useCanvas()

  const [lineStart, setLineStart,] = useState<Point>({ x: 0, y: 0 })
  const [isLineStartSet, setIsLineStartSet] = useState<boolean>(false);
  // const [lineEnd, setLineEnd,] = useState<Point>({ x: 0, y: 0 })
  const [isLineEndSet, setIsLineEndSet] = useState<boolean>(false);

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
        if (mode === 'shape'){
          setShapes((prev) => [...prev, { type: 'circle', position: { x, y }, size: gridSize }])
        }
        return
      case 'r':
        if (mode === 'shape') {
          {setShapes((prev) => [...prev, { type: 'rectangle', position: { x, y }, size: gridSize }])}
        }
        return
      case 't':
        if (mode === 'shape') {
          {setShapes((prev) => [...prev, { type: 'text-box', position: { x, y }, size: gridSize }])}
        }
        return
      case 'p':
        if (mode === 'shape') {
          {setShapes((prev) => [...prev, { type: 'triangle', position: { x, y }, size: gridSize }])}
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
        
        return


      default:
        return
    }
  }

  return { handleCommandKey }
}
