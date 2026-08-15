import { useState } from 'react';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import { ModalInvitation } from 'features.invites';
import { ModalStudentsList } from 'features.students.list';
import { useTranslation } from 'react-i18next';

type LinkListStudentsT = {
  src: string;
  className?: string;
};

export const LinkListStudents = ({ className }: LinkListStudentsT) => {
  const { t } = useTranslation('classrooms');
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <ModalStudentsList onInviteStudent={() => setInviteOpen(true)}>
        <Button
          variant="ghost"
          className={cn(
            'text-text-primary !h-auto rounded-[10px] px-5 py-3 text-base leading-5 font-medium',
            className,
          )}
        >
          {t('studentsList')}
        </Button>
      </ModalStudentsList>
      <ModalInvitation
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        analyticsSource="students"
      />
    </>
  );
};
