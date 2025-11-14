export interface Point {
  x: number
  y: number
}

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
