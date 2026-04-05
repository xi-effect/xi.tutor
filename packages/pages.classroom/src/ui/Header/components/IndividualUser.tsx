import { UserProfile } from '@xipkg/userprofile';
import { useCurrentUser, useUserByRole } from 'common.services';

export const IndividualUser = ({ userId }: { userId: number }) => {
  const { data: currentUser } = useCurrentUser();
  const isTutor = currentUser?.default_layout === 'tutor';
  // Используем useUserByRole с userId напрямую
  const userRole = isTutor ? 'student' : 'tutor';
  const { data: user } = useUserByRole(userRole, userId);

  return (
    <div className="flex w-full max-w-[min(100%,300px)] min-w-0 flex-row items-center gap-2 sm:max-w-[300px] sm:flex-1">
      <UserProfile
        className="shrink-0"
        text={user?.display_name ?? user?.username}
        userId={userId}
        size="l"
        withOutText
      />
      <div className="text-xl-base min-w-0 flex-1 truncate font-semibold text-gray-100">
        {user?.display_name ?? user?.username}
      </div>
    </div>
  );
};
