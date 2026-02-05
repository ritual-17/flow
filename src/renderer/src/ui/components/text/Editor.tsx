import { defaultKeymap } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { getCM, Vim, vim } from '@replit/codemirror-vim';
import { basicSetup } from 'codemirror';
import { useEffect, useRef } from 'react';

type EditorProps = {
  initialDoc?: string;
  x: number;
  y: number;
};
export const Editor = ({ initialDoc, x, y }: EditorProps) => {
  const editor = useRef<HTMLDivElement>(null);

  const handleWrite = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const doc = update.state.doc.toString();
      console.log('Document changed:', doc);
    }
  });
  useEffect(() => {
    const startState = EditorState.create({
      doc: initialDoc || 'Hello World',
      extensions: [vim(), basicSetup, keymap.of(defaultKeymap)],
    });

    const view = new EditorView({ state: startState, parent: editor.current! });

    view.focus();
    view.contentDOM.blur();
    const cm = getCM(view);

    Vim.noremap('yy', '"+yy', 'normal');
    Vim.noremap('dd', '"+d', 'normal');
    Vim.noremap('p', '"+p', 'normal');
    Vim.noremap('P', '"+P', 'normal');

    Vim.noremap('yy', '"+y', 'normal');
    return () => {
      view.destroy();
    };
  }, [initialDoc]);

  return <div className='absolute w-52 h-44' style={{ top: y, left: x }} ref={editor}></div>;
};
