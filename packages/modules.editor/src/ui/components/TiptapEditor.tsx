import { EditorContent } from '@tiptap/react';
import { EditorToolkit } from './EditorToolkit';
import { useYjsContext } from '../../providers/YjsProvider';

export const TiptapEditor = () => {
  const { editor, isReadOnly } = useYjsContext();

  if (!editor) return null;

  return (
    <div className="flex w-full justify-center py-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-lg bg-white">
        <div className="relative px-16 py-12">
          <EditorContent editor={editor} />
          <EditorToolkit editor={editor} isReadOnly={isReadOnly} />
        </div>
      </div>
    </div>
  );
};
