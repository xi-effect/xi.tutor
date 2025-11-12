import { Badge } from '@xipkg/badge';

import { useCurrentUser, useStudentContactsById, useTutorContactsById } from 'common.services';
import { handleTelegramClick } from '../../../utils/header';
import { TelegramFilled } from '@xipkg/icons';
import { ContactT } from 'common.types';

type ContactsBadgePropsT = {
  userId: number;
};

const TelegramBadge = ({ title, link }: { title: string; link: string }) => {
  return (
    <Badge
      className="bg-brand-0 text-s-base text-brand-80 flex cursor-pointer flex-row items-center gap-2 font-medium"
      onClick={() => handleTelegramClick({ link })}
      variant="secondary"
      size="m"
    >
      <TelegramFilled className="fill-brand-80 size-4" />
      {title}
    </Badge>
  );
};

const TutorContactsBadge = ({ tutorId }: { tutorId: number }) => {
  const { data: contacts } = useTutorContactsById(tutorId);

  const telegram = contacts?.filter((contact: ContactT) => contact.kind === 'personal-telegram');

  if (!telegram || !telegram[0] || !telegram[0].is_public) return null;

  return <TelegramBadge title={telegram[0].title} link={telegram[0].link} />;
};

const StudentContactsBadge = ({ studentId }: { studentId: number }) => {
  const { data: contacts } = useStudentContactsById(studentId);

  const telegram = contacts?.filter((contact: ContactT) => contact.kind === 'personal-telegram');

  if (!telegram || !telegram[0] || !telegram[0].is_public) return null;

  return <TelegramBadge title={telegram[0].title} link={telegram[0].link} />;
};

export const ContactsBadge = ({ userId }: ContactsBadgePropsT) => {
  const { data: user } = useCurrentUser();

  const isTutor = user?.default_layout === 'tutor';

  if (isTutor) {
    return <StudentContactsBadge studentId={userId} />;
  }

  return <TutorContactsBadge tutorId={userId} />;
};
