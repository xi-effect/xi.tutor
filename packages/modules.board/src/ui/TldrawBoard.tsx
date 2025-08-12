import { TldrawCanvas } from './components';
import { useGetMaterial } from 'common.services';
import { useParams } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';

export const TldrawBoard = () => {
  const { boardId = 'empty' } = useParams({ strict: false });
  const { data, isLoading } = useGetMaterial(boardId);

  console.log('data', data);

  if (isLoading) return <LoadingScreen />;

  return <TldrawCanvas />;
};
