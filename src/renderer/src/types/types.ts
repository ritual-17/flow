export interface Point {
  x: number
  y: number
}

export type Mode = 'shape' | 'line' | 'arrow'

export interface Shape {
  id: string
  type: 'circle' | 'rectangle' | 'text-box' | 'triangle'
  position: Point
  size: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  rotation?: number // degrees
}

export interface Line {
  type: 'line' | 'arrow'
  position1: Point
  position2: Point
  size: number
}
