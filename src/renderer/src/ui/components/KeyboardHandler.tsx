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

      // handle shift+arrow keys
      if (e.shiftKey) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          appendCommandBuffer('<Shift-ArrowUp>');
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          appendCommandBuffer('<Shift-ArrowDown>');
          return;
        }

        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          appendCommandBuffer('<Shift-ArrowLeft>');
          return;
        }

        if (e.key === 'ArrowRight') {
          e.preventDefault();
          appendCommandBuffer('<Shift-ArrowRight>');
          return;
        }
      }

      // handle arrow keys
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        appendCommandBuffer('ArrowUp');
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        appendCommandBuffer('ArrowDown');
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        appendCommandBuffer('ArrowLeft');
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        appendCommandBuffer('ArrowRight');
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
