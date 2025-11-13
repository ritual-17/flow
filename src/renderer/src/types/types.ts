export interface Point {
  x: number
  y: number
}

export interface Shape {
  type: 'circle' | 'rectangle' | 'text-box' | 'triangle'
  position: Point
  size: number
}
