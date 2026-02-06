// components/KeyboardHandler.tsx
import { useStore } from '@renderer/ui/Store';
import { useEffect } from 'react';

// takes in keyboard input and updates command buffer (seen at bottom left of the screen)
export function KeyboardHandler() {
  const mode = useStore((state) => state.editor.mode);
  const updateCommandBuffer = useStore((state) => state.updateCommandBuffer);
  const appendCommandBuffer = useStore((state) => state.appendCommandBuffer);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'command') return;
      if (mode === 'text') return;

      handleKeyWithCommandBuffer(e);
    };

    const handleKeyWithCommandBuffer = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        updateCommandBuffer('<Esc>');
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        appendCommandBuffer('<Space>');
        return;
      }

      if (e.key.length === 1) {
        // Append character to command buffer
        appendCommandBuffer(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, updateCommandBuffer, appendCommandBuffer]);

  return null; // This component doesn't render anything
}
