import Circle from '@renderer/components/shapes/Circle'
import Rectangle from '@renderer/components/shapes/Rectangle'
import { Triangle } from '@renderer/components/shapes/Triangle'
import { useCanvas } from '@renderer/context/CanvasContext'
import { useSelection } from '@renderer/context/Hooks'

const selectedStrokeColor = 'rgba(50, 132, 255, 1)'

const ShapesDisplay = () => {
  const { shapes } = useCanvas()
  const { selectedShapeIds } = useSelection()

  return (
    <>
      {shapes.map((shape, index) => {
        const isSelected = selectedShapeIds.has(shape.id)

        if (shape.type === 'circle') {
          return (
            <Circle
              key={shape.id}
              id={shape.id}
              type={shape.type}
              position={shape.position}
              size={shape.size}
              fill="rgba(255,0,0,0.3)"
              stroke={isSelected ? selectedStrokeColor : 'transparent'}
              strokeWidth={isSelected ? 2 : 0}
            />
          )
        } else if (shape.type === 'rectangle') {
          return (
            <Rectangle
              key={shape.id}
              id={shape.id}
              type={shape.type}
              position={shape.position}
              size={shape.size}
              fill="rgba(0,255,0,0.3)"
              stroke={isSelected ? selectedStrokeColor : 'transparent'}
              strokeWidth={isSelected ? 2 : 0}
              rotation={shape.rotation}
            />
          )
        } else if (shape.type === 'text-box') {
          return (
            <div
              key={`shape-${index}`}
              style={{
                position: 'absolute',
                left: shape.position.x - shape.size,
                top: shape.position.y - shape.size / 2,
                width: shape.size * 2,
                height: shape.size,
                backgroundColor: 'rgba(255,255,0,0.3)',
                borderColor: isSelected ? selectedStrokeColor : 'transparent',
                borderWidth: isSelected ? 2 : 0
              }}
              className="flex items-center justify-center"
            >
              Text Box
            </div>
          )
        } else if (shape.type === 'triangle') {
          return (
            <Triangle
              key={`shape-${index}`}
              id={shape.id}
              type={shape.type}
              position={shape.position}
              size={shape.size}
              fill="rgba(0,0,255,0.3)"
              stroke={isSelected ? selectedStrokeColor : 'transparent'}
              strokeWidth={isSelected ? 2 : 0}
              rotation={shape.rotation}
            />
          )
        }
        return null
      })}
    </>
  )
}

export default ShapesDisplay
