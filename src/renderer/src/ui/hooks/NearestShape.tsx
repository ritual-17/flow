import { useStore } from '@renderer/ui/Store';

export const useNearestShape = () => {
  const cursorPosition = useStore((state) => state.editor.cursorPosition);
  const commandDispatcher = useStore((state) => state.commandDispatcher);
  const spatialIndex = commandDispatcher.spatialIndex;
  return spatialIndex.getNearestShapeId(cursorPosition);
};
