import { Editor } from 'modules.editor';
import { Header } from './Header';

export const Note = () => {
  return (
    <div className="bg-gray-5 flex h-full min-h-[calc(100dvh)] flex-col overflow-auto px-5 pt-3.5 pb-5">
      <Header />
      <Editor />
    </div>
  );
};
