import { UserProfile } from '@xipkg/userprofile';
import { useCurrentUser, useUserByRole } from 'common.services';
import { EditableClassroomName } from './EditableClassroomName';

export const IndividualUser = ({
  userId,
  classroomId,
  nameOverride,
  canEdit,
}: {
  userId: number;
  classroomId: number;
  nameOverride?: string | null;
  canEdit: boolean;
}) => {
  const { data: currentUser } = useCurrentUser();
  const isTutor = currentUser?.default_layout === 'tutor';
  const userRole = isTutor ? 'student' : 'tutor';
  const { data: user } = useUserByRole(userRole, userId);
  const profileName = user?.display_name ?? user?.username;
  const title = isTutor && nameOverride?.trim() ? nameOverride.trim() : (profileName ?? '');

  return (
    <div className="flex min-w-0 flex-1 flex-row items-center gap-3">
      <UserProfile className="shrink-0" text={title} userId={userId} size="l" withOutText />
      <EditableClassroomName
        classroomId={classroomId}
        kind="individual"
        name={title}
        canEdit={canEdit}
      />
    </div>
  );
};
