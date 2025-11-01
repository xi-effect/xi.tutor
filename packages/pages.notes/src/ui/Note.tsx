import { Editor } from 'modules.editor';
import { Header } from './Header';

export const Note = () => {
  return (
    <div className="flex w-full justify-center overflow-auto py-8">
      <div className="w-full max-w-4xl pl-16">
        <Header />
        <Editor />
      </div>
    </div>
  );
};
