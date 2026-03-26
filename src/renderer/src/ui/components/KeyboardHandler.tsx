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
        if (e.ctrlKey) {
          if (e.key === 'ArrowUp' || e.key === 'K') {
            e.preventDefault();
            appendCommandBuffer('<C-Shift-Up>');
            return;
          }

          if (e.key === 'ArrowDown' || e.key === 'J') {
            e.preventDefault();
            appendCommandBuffer('<C-Shift-Down>');
            return;
          }

          if (e.key === 'ArrowLeft' || e.key === 'H') {
            e.preventDefault();
            appendCommandBuffer('<C-Shift-Left>');
            return;
          }

          if (e.key === 'ArrowRight' || e.key === 'L') {
            e.preventDefault();
            appendCommandBuffer('<C-Shift-Right>');
            return;
          }
        }

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

      // handle ctrl+e for export
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        appendCommandBuffer('<C-e>');
        return;
      }

      // handle ctrl/meta + arrow keys or hjkl for fast movement
      if (e.ctrlKey && mode !== 'anchor-line') {
        if (e.key === 'ArrowUp' || e.key === 'k') {
          e.preventDefault();
          appendCommandBuffer('<C-Up>');
          return;
        }

        if (e.key === 'ArrowDown' || e.key === 'j') {
          e.preventDefault();
          appendCommandBuffer('<C-Down>');
          return;
        }

        if (e.key === 'ArrowLeft' || e.key === 'h') {
          e.preventDefault();
          appendCommandBuffer('<C-Left>');
          return;
        }

        if (e.key === 'ArrowRight' || e.key === 'l') {
          e.preventDefault();
          appendCommandBuffer('<C-Right>');
          return;
        }

        // Viewport scrolling with Ctrl + (u, d, ,, .)
        if (e.key === 'u') {
          e.preventDefault();
          updateCommandBuffer('<View-Up>');
          return;
        }

        if (e.key === 'd') {
          e.preventDefault();
          updateCommandBuffer('<View-Down>');
          return;
        }

        if (e.key === ',') {
          e.preventDefault();
          updateCommandBuffer('<View-Left>');
          return;
        }

        if (e.key === '.') {
          e.preventDefault();
          updateCommandBuffer('<View-Right>');
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
