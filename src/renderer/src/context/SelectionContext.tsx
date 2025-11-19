import { useCanvas } from '@renderer/context/CanvasContext'
import { SelectionContext } from '@renderer/context/Hooks'
import { Shape } from '@renderer/types/types'
import { ReactNode, useState } from 'react'

export interface SelectionContextType {
  selectedShapeIds: Set<Shape['id']>
  setSelectedShapeIds: React.Dispatch<React.SetStateAction<Set<string>>>
  selectClosestShape: () => void
  clearSelection: () => void
}

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedShapeIds, setSelectedShapeIds] = useState<Set<Shape['id']>>(new Set())

  const clearSelection = () => {
    setSelectedShapeIds(new Set())
  }

  const { cursorPosition, shapes } = useCanvas()

  const selectClosestShape = () => {
    if (shapes.length === 0) return

    let closestShape: Shape | null = null
    let closestDistance = Infinity

    shapes.forEach((shape) => {
      const dx = shape.position.x - cursorPosition.x
      const dy = shape.position.y - cursorPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < closestDistance) {
        closestDistance = distance
        closestShape = shape
      }
    })

    if (closestShape) {
      if (selectedShapeIds.has(closestShape.id)) {
        // If the closest shape is already selected, deselect it
        const newSelectedShapeIds = new Set(selectedShapeIds)
        newSelectedShapeIds.delete(closestShape.id)
        setSelectedShapeIds(newSelectedShapeIds)
        return
      }
      //@ts-ignore the compiler complains that closestShape is possibly null here, but we check for that above
      setSelectedShapeIds(new Set([closestShape.id]))
    }
  }

  console.log(`Selected Shape IDs: ${Array.from(selectedShapeIds).join(', ')}`)

  return (
    <SelectionContext.Provider
      value={{
        selectedShapeIds,
        setSelectedShapeIds,
        selectClosestShape,
        clearSelection
      }}
    >
      {children}
    </SelectionContext.Provider>
  )
}
