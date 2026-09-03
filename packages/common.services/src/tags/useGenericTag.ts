import { TAG_KIND } from 'common.api';
import { useCurrentUser } from '../user';
import { useGenericTags } from './useGenericTags';
import { useTagById } from './useTagById';

export const useGenericTag = (id: number, disabled?: boolean) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const catalog = useGenericTags({ enabled: isTutor && !disabled });
  const fromCatalog = catalog.tags.find((tag) => tag.id === id);
  const catalogReady = catalog.isFetched || catalog.isSuccess;
  const fetchById = !disabled && Number.isInteger(id) && id > 0 && !isTutor;
  const byId = useTagById(TAG_KIND.Generic, id, !fetchById);

  if (isTutor && catalogReady) {
    return {
      data: fromCatalog,
      isLoading: false,
      isError: catalog.isError,
    };
  }

  if (isTutor) {
    return {
      data: fromCatalog,
      isLoading: catalog.isLoading,
      isError: catalog.isError,
    };
  }

  return byId;
};
