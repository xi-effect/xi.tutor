import { UserProfile } from '@xipkg/userprofile';
import { useCurrentUser, useStudentById, useTutorById } from 'common.services';

export const IndividualUser = ({ userId }: { userId: number }) => {
  const { data: currentUser } = useCurrentUser();
  const isTutor = currentUser?.default_layout === 'tutor';
  const getUser = isTutor ? useStudentById : useTutorById;
  const { data: user } = getUser(userId);

  return (
    <div className="flex flex-row items-center gap-2">
      <UserProfile
        text={user?.display_name ?? user?.username}
        userId={userId}
        size="l"
        withOutText
      />
      <div className="text-xl-base font-semibold text-gray-100">
        {user?.display_name ?? user?.username}
      </div>
    </div>
  );
};
