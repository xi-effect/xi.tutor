import { UserProfile } from '@xipkg/userprofile';
import { useCurrentUser, useUserByRole } from 'common.services';
import { classroomPageTitleClass } from '../../sectionTitleClass';

export const IndividualUser = ({ userId }: { userId: number }) => {
  const { data: currentUser } = useCurrentUser();
  const isTutor = currentUser?.default_layout === 'tutor';
  const userRole = isTutor ? 'student' : 'tutor';
  const { data: user } = useUserByRole(userRole, userId);

  return (
    <div className="flex min-w-0 flex-1 flex-row items-center gap-3">
      <UserProfile
        className="shrink-0"
        text={user?.display_name ?? user?.username}
        userId={userId}
        size="l"
        withOutText
      />
      <h1 className={classroomPageTitleClass}>{user?.display_name ?? user?.username}</h1>
    </div>
  );
};
