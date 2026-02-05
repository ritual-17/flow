import { defaultKeymap } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { useStore } from '@renderer/ui/Store';
import { getCM, Vim, vim } from '@replit/codemirror-vim';
import { basicSetup } from 'codemirror';
import { useEffect, useRef, useState } from 'react';

type EditorProps = {
  initialDoc?: string;
  x: number;
  y: number;
};
export const Editor = ({ initialDoc, x, y }: EditorProps) => {
  const editor = useRef<HTMLDivElement>(null);
  const mode = useStore((state) => state.editor.mode);
  const [content, setContent] = useState(initialDoc || '');

  const handleWrite = EditorView.updateListener.of((update) => {
    const doc = update.state.doc.toString();
    setContent(doc);
  });

  useEffect(() => {
    const preventDefaults = EditorView.domEventHandlers({
      keydown: (event, _view) => {
        // Only intercept when in non-text mode
        if (mode !== 'text') {
          event.preventDefault();
          return true; // true means "I handled this event"
        }
        return false; // false means "let CodeMirror handle it"
      },
    });

    const startState = EditorState.create({
      doc: initialDoc || '',
      extensions: [vim(), basicSetup, keymap.of(defaultKeymap), preventDefaults, handleWrite],
    });

    const view = new EditorView({ state: startState, parent: editor.current! });

    view.focus();
    // view.contentDOM.blur();
    const cm = getCM(view);

    Vim.noremap('yy', '"+yy', 'normal');
    Vim.noremap('dd', '"+d', 'normal');
    Vim.noremap('p', '"+p', 'normal');
    Vim.noremap('P', '"+P', 'normal');

    Vim.noremap('yy', '"+y', 'normal');
    return () => {
      view.destroy();
    };
  }, [initialDoc, mode]);

  return <div className='absolute w-52 h-44' style={{ top: y, left: x }} ref={editor}></div>;
};
