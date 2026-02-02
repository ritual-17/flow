import { defaultKeymap } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { keymap } from '@codemirror/view';
import { vim } from '@replit/codemirror-vim';
import React, { useEffect, useRef } from 'react';

interface TextBoxEditorProps {
  initialText: string;
  onTextChange: (text: string) => void;
  onExit: () => void;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const TextBoxEditor: React.FC<TextBoxEditorProps> = ({
  initialText,
  onTextChange,
  onExit,
  x,
  y,
  width,
  height,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create vim keybindings with custom Esc handler
    const vimExtension = vim({
      status: true,
    });

    // Create editor state
    const startState = EditorState.create({
      doc: initialText,
      extensions: [
        keymap.of(defaultKeymap),
        vimExtension,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onTextChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            backgroundColor: '#1f2937',
            color: '#d1d5db',
            fontFamily: 'monospace',
            fontSize: '14px',
            height: '100%',
          },
          '.cm-content': {
            caretColor: '#60a5fa',
            padding: '8px',
          },
          '.cm-cursor': {
            borderLeftColor: '#60a5fa',
          },
          '.cm-activeLine': {
            backgroundColor: '#374151',
          },
          '.cm-gutters': {
            backgroundColor: '#111827',
            color: '#6b7280',
            border: 'none',
          },
          '&.cm-focused': {
            outline: '2px solid #3b82f6',
          },
        }),
      ],
    });

    // Create editor view
    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Focus the editor
    view.focus();

    // Add global escape handler for exiting
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check if we're in vim normal mode and Escape is pressed twice
      // Or if Ctrl+C is pressed to exit
      if (e.key === 'Escape' && e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        onExit();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, true);
      view.destroy();
    };
  }, [initialText, onTextChange, onExit]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 1000,
        backgroundColor: '#1f2937',
        border: '2px solid #3b82f6',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div ref={editorRef} style={{ height: '100%', width: '100%' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '8px',
          fontSize: '10px',
          color: '#9ca3af',
          backgroundColor: '#111827',
          padding: '2px 6px',
          borderRadius: '2px',
        }}
      >
        Ctrl+Esc to exit
      </div>
    </div>
  );
};
