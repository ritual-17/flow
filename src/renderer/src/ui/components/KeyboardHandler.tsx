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
      console.log('Key down:', e.key, 'Mode:', mode);
      if (mode === 'command') return;
      if (mode === 'text') {
        handleKeyTextMode(e);
        return;
      }

      handleKeyWithCommandBuffer(e);
    };

    const handleKeyTextMode = (e: KeyboardEvent) => {
      if (mode !== 'text') return;

      if (e.key === 'Tab') {
        e.preventDefault(); // need to prevent default on this to stop focus change
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        updateCommandBuffer('<Esc>');
      }
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

      if (e.key === 'Tab') {
        e.preventDefault(); // need to prevent default on this to stop focus change
        appendCommandBuffer('<Tab>');
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        appendCommandBuffer('<Enter>');
        return;
      }

      // ignore special keys like Shift, Ctrl, etc.
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
