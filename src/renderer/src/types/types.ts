export interface Point {
  x: number
  y: number
}

export type Mode = 'shape' | 'line'

export interface Shape {
  type: 'circle' | 'rectangle' | 'text-box' | 'triangle'
  position: Point
  size: number
}

export interface Line {
  type: 'line' | 'arrow'
  position1: Point
  position2: Point
  size: number
}
