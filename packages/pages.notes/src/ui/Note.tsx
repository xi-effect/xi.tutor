import { Editor } from 'modules.editor';
import { Header } from './Header';

export const Note = () => {
  return (
    <div className="flex flex-col">
      <Header />
      <Editor />
    </div>
  );
};
