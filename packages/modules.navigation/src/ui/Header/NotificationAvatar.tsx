import {
  useGetClassroom,
  useGetClassroomStudent,
  useGetRecipientInvoiceByStudent,
  useGetRecipientInvoiceByTutor,
  useStudentById,
} from 'common.services';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { NotificationKind } from 'common.types';

const RecipientInvoiceAvatarByTutor = ({ recipientInvoiceId }: { recipientInvoiceId: number }) => {
  const { data: recipientInvoiceDataTutor } = useGetRecipientInvoiceByTutor(recipientInvoiceId);
  const { data: studentData } = useStudentById(recipientInvoiceDataTutor?.student_id);

  return (
    <Avatar size={avatarSize}>
      <AvatarImage
        src={`https://api.sovlium.ru/files/users/${recipientInvoiceDataTutor?.student_id}/avatar.webp`}
        alt="user avatar"
      />
      <AvatarFallback size={avatarSize}>
        {studentData?.name?.[0]?.toUpperCase() || ''}
      </AvatarFallback>
    </Avatar>
  );
};

const RecipientInvoiceAvatarByStudent = ({
  recipientInvoiceId,
}: {
  recipientInvoiceId: number;
}) => {
  const { data: recipientInvoiceDataStudent } = useGetRecipientInvoiceByStudent(recipientInvoiceId);

  return (
    <Avatar size={avatarSize}>
      <AvatarImage
        src={`https://api.sovlium.ru/files/users/${recipientInvoiceDataStudent?.tutor_id}/avatar.webp`}
        alt="user avatar"
      />
      <AvatarFallback size={avatarSize}>
        {recipientInvoiceDataStudent?.name?.[0]?.toUpperCase() || ''}
      </AvatarFallback>
    </Avatar>
  );
};

const avatarSize = 'l';

const ClassroomAvatarByStudent = ({ classroomId }: { classroomId: number }) => {
  const { data: classroomDataStudent } = useGetClassroomStudent(classroomId);

  return (
    <Avatar size={avatarSize}>
      <AvatarImage
        src={`https://api.sovlium.ru/files/users/${classroomDataStudent?.tutor_id}/avatar.webp`}
        alt="user avatar"
      />
      <AvatarFallback size={avatarSize}>
        {classroomDataStudent?.name?.[0]?.toUpperCase() || ''}
      </AvatarFallback>
    </Avatar>
  );
};

const ClassroomAvatarByTutor = ({ classroomId }: { classroomId: number }) => {
  const { data: classroomDataTutor } = useGetClassroom(classroomId);

  return (
    <Avatar size={avatarSize}>
      <AvatarImage
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        src={`https://api.sovlium.ru/files/users/${classroomDataTutor?.student_id}/avatar.webp`}
        alt="user avatar"
      />
      <AvatarFallback size={avatarSize}>
        {classroomDataTutor?.name?.[0]?.toUpperCase() || ''}
      </AvatarFallback>
    </Avatar>
  );
};

type UserAvatarPropsT = {
  classroomId?: number;
  recipientInvoiceId?: number;
  kind: NotificationKind;
};

export const NotificationAvatar = ({ classroomId, recipientInvoiceId, kind }: UserAvatarPropsT) => {
  if (kind === 'classroom_conference_started_v1' || kind === 'enrollment_created_v1') {
    return <ClassroomAvatarByStudent classroomId={classroomId ?? 0} />;
  }

  if (kind === 'individual_invitation_accepted_v1' || kind === 'group_invitation_accepted_v1') {
    return <ClassroomAvatarByTutor classroomId={classroomId ?? 0} />;
  }

  if (kind === 'recipient_invoice_created_v1') {
    return <RecipientInvoiceAvatarByStudent recipientInvoiceId={recipientInvoiceId ?? 0} />;
  }

  if (kind === 'student_recipient_invoice_payment_confirmed_v1') {
    return <RecipientInvoiceAvatarByTutor recipientInvoiceId={recipientInvoiceId ?? 0} />;
  }

  return null;
};
