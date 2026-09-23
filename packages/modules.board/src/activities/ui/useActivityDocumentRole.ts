import { useCurrentUser } from 'common.services';

export function useActivityDocumentRole(isReadOnly: boolean) {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  return {
    isTutor: Boolean(isTutor),
    canEdit: Boolean(isTutor && !isReadOnly),
  };
}
