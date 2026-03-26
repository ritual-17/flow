import { isLine, Shape, ShapeId } from '@renderer/core/geometry/Shape';
import { isAnchorRef } from '@renderer/core/geometry/utils/AnchorPoints';
import { generateId } from '@renderer/core/utils/id';

export function cloneShapes(shapes: Shape[]) {
  const oldToNewId: Map<ShapeId, ShapeId> = new Map();
  const newShapes: Shape[] = [];

  shapes.forEach((shape) => {
    const newShape = cloneWithNewId(shape);
    newShapes.push(newShape);
    oldToNewId.set(shape.id, newShape.id);
  });

  return newShapes.map((shape) => {
    if (!isLine(shape)) return shape;

    const points = shape.points;
    const updatedRefPoints = points.map((point) => {
      if (!isAnchorRef(point)) return point;

      const oldRefId = point.shapeId;
      const newRefId = oldToNewId.get(oldRefId);

      if (!newRefId) {
        throw Error('Error cloning line. An old AnchorRef is still being referenced.');
      }

      return { ...point, shapeId: newRefId };
    });

    return {
      ...shape,
      points: updatedRefPoints,
    };
  });
}

function cloneWithNewId<T extends Shape>(shape: T): T {
  return {
    ...shape,
    id: generateId(),
  };
}
