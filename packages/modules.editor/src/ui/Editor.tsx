import { useEditor, EditorContent } from '@tiptap/react';
import content from '../const/content';
import { extensions } from '../config/editorConfig';
import { editorProps } from '../config/editorProps';
import { EditorToolkit } from './components/EditorToolkit';

export const Editor = () => {
  const editor = useEditor({
    extensions,
    content,
    editorProps,
  });

  if (!editor) return null;

  return (
    <div className="flex w-full justify-center py-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-lg bg-white">
        <div className="relative px-16 py-8">
          <EditorContent editor={editor} />
          <EditorToolkit editor={editor} />
        </div>
      </div>
    </div>
  );
};
