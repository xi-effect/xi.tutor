import { useState } from 'react';
import { useCurrentUser } from 'common.services';
import { getUserAvatarUrl } from 'common.utils';

export type ClassroomSelectAvatarSource = {
  kind?: string;
  name?: string | null;
  name_override?: string | null;
  student_id?: number;
  tutor_id?: number;
};

const getClassroomName = (classroom: ClassroomSelectAvatarSource) => {
  const override = classroom.name_override?.trim();
  if (override) return override;
  return classroom.name?.trim() ?? '';
};

const getCounterpartUserId = (classroom: ClassroomSelectAvatarSource, isTutor: boolean) => {
  if (classroom.kind !== 'individual') {
    return undefined;
  }

  return isTutor ? classroom.student_id : (classroom.tutor_id ?? classroom.student_id);
};

const GroupClassroomAvatar = ({ name }: { name: string }) => (
  <div className="bg-action-primary-background-default text-text-on-accent flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
    {name[0]?.toUpperCase() ?? ''}
  </div>
);

const IndividualClassroomAvatar = ({
  classroom,
  name,
}: {
  classroom: ClassroomSelectAvatarSource;
  name: string;
}) => {
  const { data: currentUser } = useCurrentUser();
  const isTutor = currentUser?.default_layout === 'tutor';
  const userId = getCounterpartUserId(classroom, isTutor);
  const avatarUrl = getUserAvatarUrl(userId);
  const [failed, setFailed] = useState(false);
  const letter = name[0]?.toUpperCase() ?? '?';

  if (!avatarUrl || failed) {
    return (
      <div className="bg-background-subtle text-text-primary flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
        {letter}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt=""
      className="size-6 shrink-0 rounded-full object-cover"
      onError={() => setFailed(true)}
    />
  );
};

export const ClassroomSelectAvatar = ({
  classroom,
}: {
  classroom: ClassroomSelectAvatarSource;
}) => {
  const name = getClassroomName(classroom);

  if (classroom.kind === 'group') {
    return <GroupClassroomAvatar name={name} />;
  }

  return <IndividualClassroomAvatar classroom={classroom} name={name} />;
};

export const ClassroomSelectOption = ({
  classroom,
}: {
  classroom: ClassroomSelectAvatarSource;
}) => {
  const name = getClassroomName(classroom);

  return (
    <span className="flex min-w-0 items-center gap-2">
      <ClassroomSelectAvatar classroom={classroom} />
      <span className="min-w-0 truncate">{name}</span>
    </span>
  );
};
