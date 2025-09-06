import { YjsProvider } from '../providers/YjsProvider';
import { TiptapEditor } from './components/TiptapEditor';

export const Editor = () => {
  return (
    <YjsProvider>
      <TiptapEditor />
    </YjsProvider>
  );
};
