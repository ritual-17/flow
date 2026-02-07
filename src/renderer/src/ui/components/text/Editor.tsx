import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { useStore } from '@renderer/ui/Store';
import { Vim, vim } from '@replit/codemirror-vim';
import { basicSetup } from 'codemirror';
import { useEffect, useRef } from 'react';

type EditorProps = {
  initialDoc?: string;
  setContent: (n: string) => void;
  x: number;
  y: number;
};
//
// remapping some functions to use system clipboard
Vim.noremap('yy', '"+yy', 'normal');
Vim.noremap('dd', '"+dd', 'normal');
Vim.noremap('p', '"+p', 'normal');
Vim.noremap('P', '"+P', 'normal');

export const Editor = ({ initialDoc, x, y, setContent }: EditorProps) => {
  const editor = useRef<HTMLDivElement>(null);
  const mode = useStore((state) => state.editor.mode);

  useEffect(() => {
    const handleWrite = EditorView.updateListener.of((update) => {
      if (!update.docChanged) return; // ignores updates that don't change the document e.g. cursor movements

      const doc = update.state.doc.toString();
      setContent(doc);
    });

    const startState = EditorState.create({
      doc: initialDoc || '',
      extensions: [vim(), basicSetup, keymap.of([...defaultKeymap, indentWithTab]), handleWrite],
    });

    const view = new EditorView({ state: startState, parent: editor.current! });

    view.focus();

    // clean up function
    return () => {
      view.destroy();
    };
  }, [initialDoc, mode, setContent]);

  return <div className='absolute w-52 h-44' style={{ top: y, left: x }} ref={editor}></div>;
};
