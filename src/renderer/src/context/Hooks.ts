import { SelectionContextType } from '@renderer/context/SelectionContext'
import { createContext, useContext } from 'react'

export const SelectionContext = createContext<SelectionContextType | undefined>(undefined)

export const useSelection = (): SelectionContextType => {
  const context = useContext(SelectionContext)
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider')
  }
  return context
}
