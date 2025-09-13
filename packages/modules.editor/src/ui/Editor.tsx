import { YjsProvider } from '../providers/YjsProvider';
import { TiptapEditor } from './components/TiptapEditor';
import { useParams } from '@tanstack/react-router';
import { useGetMaterial } from 'common.services';
import { LoadingScreen } from 'common.ui';

export const Editor = () => {
  const { editorId = 'empty' } = useParams({ strict: false });
  const { data, isLoading, error } = useGetMaterial(editorId);

  if (isLoading) return <LoadingScreen />;

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-500">Ошибка загрузки: {error.message}</div>
      </div>
    );

  return (
    <YjsProvider data={data}>
      <TiptapEditor />
    </YjsProvider>
  );
};
