import React, { useState, MouseEvent, useEffect } from 'react'

interface Point {
  x: number
  y: number
}

interface Shape {
  type: 'circle' | 'rectangle' | 'text-box' | 'triangle'
  position: Point
  size: number
}

const GridWithCircle: React.FC = () => {
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight
  const [gridSize, setGridSize] = useState<number>(20)

  const [origin, setOrigin] = useState<Point>({ x: 300, y: 200 })
  const [radius, _] = useState<number>(40)

  const svgRef = React.useRef<SVGSVGElement | null>(null)

  const [shapes, setShapes] = useState<Shape[]>([])

  useEffect(() => {
    svgRef.current?.focus()
  }, [])

  const updateOrigin = ({ x, y }: Point, gridSize: number): void => {
    const diffX = x % gridSize
    if (diffX < gridSize / 2) {
      x -= diffX
    } else {
      x += gridSize - diffX
    }

    const diffY = y % gridSize
    if (diffY < gridSize / 2) {
      y -= diffY
    } else {
      y += gridSize - diffY
    }

    setOrigin({ x, y })
  }

  const handleClick = (e: MouseEvent<SVGSVGElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top

    updateOrigin({ x, y }, gridSize)
  }

  const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>): void => {
    let { x, y } = origin
    const step = gridSize

    switch (e.key) {
      case 'h':
        x -= step
        break
      case 'l':
        x += step
        break
      case 'j':
        y += step
        break
      case 'k':
        y -= step
        break
      case '+':
        const newGridSize = gridSize + 5
        setGridSize(newGridSize)
        updateOrigin({ x, y }, newGridSize)
        return
      case '-':
        const decreasedGridSize = Math.max(5, gridSize - 5)
        setGridSize(decreasedGridSize)
        updateOrigin({ x, y }, decreasedGridSize)
        return
      case 'c':
        setShapes((prev) => [...prev, { type: 'circle', position: { x, y }, size: gridSize }])
        console.log('Shapes:', shapes)
        return
      case 'r':
        setShapes((prev) => [...prev, { type: 'rectangle', position: { x, y }, size: gridSize }])
        console.log('Shapes:', shapes)
        return
      case 't':
        setShapes((prev) => [...prev, { type: 'text-box', position: { x, y }, size: gridSize }])
        console.log('Shapes:', shapes)
        return
      case 'p':
        setShapes((prev) => [...prev, { type: 'triangle', position: { x, y }, size: gridSize }])
        console.log('Shapes:', shapes)
        return
      default:
        return
    }

    setOrigin({ x, y })
  }

  const verticalLines = Array.from({ length: Math.floor(width / gridSize) + 1 }, (_, i) => (
    <line
      key={`v-${i}`}
      x1={i * gridSize}
      y1={0}
      x2={i * gridSize}
      y2={height}
      stroke="#ccc"
      strokeWidth={0.5}
    />
  ))

  const horizontalLines = Array.from({ length: Math.floor(height / gridSize) + 1 }, (_, i) => (
    <line
      key={`h-${i}`}
      x1={0}
      y1={i * gridSize}
      x2={width}
      y2={i * gridSize}
      stroke="#ccc"
      strokeWidth={0.5}
    />
  ))

  return (
    <div className="flex justify-center items-center bg-green-50 h-screen w-full">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-white border border-gray-400"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {verticalLines}
        {horizontalLines}

        {/* Circle at origin */}
        {/* <circle cx={origin.x} cy={origin.y} r={radius} fill="rgba(0,0,255,0.3)" /> */}

        {/* Origin marker */}
        {/* <circle cx={origin.x} cy={origin.y} r={3} fill="red" /> */}
      </svg>
      {/* Cursor */}
      <div
        style={{
          position: 'absolute',
          left: origin.x - 2,
          top: origin.y - 2,
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'red'
        }}
      />

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
    </div>
  )
}

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <GridWithCircle />
    </>
  )
}

export default App
