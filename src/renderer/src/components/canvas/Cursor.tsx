import { useCanvas } from '@renderer/context/CanvasContext'

const Cursor = () => {
  const { cursorPosition } = useCanvas()
  return (
    <div
      style={{
        position: 'absolute',
        left: cursorPosition.x - 2,
        top: cursorPosition.y - 2,
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: 'red'
      }}
    />
  )
}

export default Cursor
