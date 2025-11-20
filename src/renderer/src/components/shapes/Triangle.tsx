import { Shape } from '@renderer/types/types'

export function Triangle({
  position: { x, y },
  size,
  fill = 'none',
  stroke = 'none',
  strokeWidth = 0,
  rotation = 0
}: Shape) {
  // triangle points (pointing up) centered at (0,0)
  const points = [
    [0, -size], // top
    [-size, size], // bottom-left
    [size, size] // bottom-right
  ]
    .map((p) => p.join(','))
    .join(' ')

  return (
    <svg
      width={size * 2}
      height={size * 2}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        overflow: 'visible'
      }}
    >
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        transform={`rotate(${rotation})`}
      />
    </svg>
  )
}
