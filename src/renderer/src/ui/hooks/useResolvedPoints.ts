import { MultiLine } from '@renderer/core/geometry/shapes/MultiLine';
import * as AnchorPoints from '@renderer/core/geometry/utils/AnchorPoints';
import { useStore } from '@renderer/ui/Store';

export const useResolvedPoints = (shape: MultiLine) => {
  const document = useStore((state) => state.document);

  return AnchorPoints.resolveLinePoints(document, shape);
};
