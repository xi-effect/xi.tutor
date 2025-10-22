import { EditorContent } from '@tiptap/react';
import { EditorToolkit } from './EditorToolkit';
import { useYjsContext } from '../../hooks/useYjsContext';
import '../editor.css';

export const TiptapEditor = () => {
  const { editor, isReadOnly } = useYjsContext();

  if (!editor) {
    return (
      <div className="flex w-full justify-center py-8">
        <div className="w-full max-w-5xl overflow-hidden rounded-lg bg-white">
          <div className="relative px-16 py-12">
            <div className="text-center text-gray-500">Инициализация редактора...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center overflow-auto py-8">
      <div className="w-full max-w-4xl pl-16">
        <div className="relative">
          <EditorContent
            editor={editor}
            className="prose prose-gray max-w-none focus:outline-none"
          />
          <EditorToolkit editor={editor} isReadOnly={isReadOnly} />
        </div>
      </div>
    </div>
  );
};
