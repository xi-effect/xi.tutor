import { useCurrentUser } from '../user';

export const useTutorBillingScope = (enabled = true) => {
  const { data: user } = useCurrentUser();
  const userId = typeof user?.id === 'number' ? user.id : null;
  const isTutor = user?.default_layout === 'tutor';

  return {
    userId,
    isTutor,
    enabled: Boolean(enabled && isTutor && userId !== null),
  };
};
