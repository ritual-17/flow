import { useCanvas } from '@renderer/context/CanvasContext'

const ShapesDisplay = () => {
  const { shapes } = useCanvas()

  return (
    <>
      {shapes.map((shape, index) => {
        if (shape.type === 'circle') {
          return (
            <div
              key={`shape-${index}`}
              style={{
                position: 'absolute',
                left: shape.position.x - shape.size,
                top: shape.position.y - shape.size,
                width: shape.size * 2,
                height: shape.size * 2,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,0,0,0.3)'
              }}
            />
          )
        } else if (shape.type === 'rectangle') {
          return (
            <div
              key={`shape-${index}`}
              style={{
                position: 'absolute',
                left: shape.position.x - shape.size,
                top: shape.position.y - shape.size,
                width: shape.size * 2,
                height: shape.size * 2,
                backgroundColor: 'rgba(0,255,0,0.3)'
              }}
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
                backgroundColor: 'rgba(255,255,0,0.3)'
              }}
              className="flex items-center justify-center"
            >
              Text Box
            </div>
          )
        } else if (shape.type === 'triangle') {
          return (
            // rotate this 90 degrees
            <div
              key={`shape-${index}`}
              style={{
                position: 'absolute',
                left: shape.position.x - shape.size,
                top: shape.position.y - shape.size,
                width: 0,
                height: 0,
                borderLeft: `${shape.size}px solid transparent`,
                borderRight: `${shape.size}px solid transparent`,
                borderBottom: `${shape.size * 2}px solid rgba(0,0,255,0.3)`,
                rotate: '45deg'
              }}
            />
          )
        }
        return null
      })}
    </>
  )
}

export default ShapesDisplay
