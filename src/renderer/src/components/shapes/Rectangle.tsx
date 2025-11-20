import { Shape } from '@renderer/types/types'

const Rectangle = ({
  position: { x, y },
  size,
  fill = 'none',
  stroke = 'none',
  strokeWidth = 0,
  rotation = 0
}: Shape) => {
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
      <rect
        x={-size}
        y={-size}
        width={size * 2}
        height={size * 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        transform={`rotate(${rotation})`}
      />
    </svg>
  )
}

export default Rectangle
