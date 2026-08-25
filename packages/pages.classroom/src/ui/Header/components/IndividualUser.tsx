import { UserProfile } from '@xipkg/userprofile';
import { useCurrentUser, useUserByRole } from 'common.services';
import { EditableClassroomName } from './EditableClassroomName';

export const IndividualUser = ({
  userId,
  classroomId,
  nameOverride,
  classroomName,
  studentName,
  canEdit,
}: {
  userId: number;
  classroomId: number;
  nameOverride?: string | null;
  classroomName?: string | null;
  studentName?: string | null;
  canEdit: boolean;
}) => {
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const isTutor = currentUser?.default_layout === 'tutor';
  const userRole = isTutor ? 'student' : 'tutor';
  const { data: user, isLoading } = useUserByRole(
    userRole,
    userId,
    isCurrentUserLoading || !currentUser || !userId,
  );
  const profileName = user?.display_name ?? user?.username;
  const title =
    (isTutor && nameOverride?.trim()) ||
    profileName?.trim() ||
    classroomName?.trim() ||
    studentName?.trim() ||
    '';

  return (
    <div className="flex min-w-0 flex-1 flex-row items-center gap-3">
      <UserProfile
        className="shrink-0"
        text={title || undefined}
        userId={userId}
        size="l"
        withOutText
        loading={isLoading && !title}
      />
      <EditableClassroomName
        classroomId={classroomId}
        kind="individual"
        name={title}
        canEdit={canEdit}
      />
    </div>
  );
};
