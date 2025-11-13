import { useEffect, useRef } from 'react'

type GridProps = {
  gridSize: number
  height: number
  width: number
}

const Grid = ({ gridSize, height, width }: GridProps) => {
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
    <>
      <svg width={width} height={height} className="bg-white border border-gray-400" tabIndex={0}>
        {verticalLines}
        {horizontalLines}

        {/* Circle at origin */}
        {/* <circle cx={origin.x} cy={origin.y} r={radius} fill="rgba(0,0,255,0.3)" /> */}

        {/* Origin marker */}
        {/* <circle cx={origin.x} cy={origin.y} r={3} fill="red" /> */}
      </svg>
    </>
  )
}

export default Grid
