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
      className="bg-status-info-background text-s-base text-text-link flex max-w-full min-w-0 cursor-pointer flex-row items-center justify-center rounded-lg border-none px-2 py-1 font-medium max-sm:w-full"
      onClick={() => handleTelegramClick({ link })}
      variant="ghost"
      size="m"
    >
      <span className="flex max-w-full min-w-0 items-center justify-center gap-2">
        <TelegramFilled className="fill-icon-brand size-4 shrink-0" />
        <span className="min-w-0 truncate">{title}</span>
      </span>
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
