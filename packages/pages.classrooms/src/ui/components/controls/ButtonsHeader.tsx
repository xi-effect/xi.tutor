import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import { ModalInvitation } from 'features.invites';
import { ModalAddGroup } from 'features.group.add';
import { useTranslation } from 'react-i18next';

export const ButtonsHeader = () => {
  const { t } = useTranslation('classrooms');

  return (
    <div className="flex flex-row items-center gap-2">
      <ModalAddGroup>
        <Button
          variant="ghost"
          className="!h-auto rounded-[10px] px-5 py-3 text-base leading-5 font-medium"
          data-umami-event="classrooms-create-group"
        >
          {t('createGroup')}
        </Button>
      </ModalAddGroup>
      <ModalInvitation analyticsSource="classrooms">
        <Button
          variant="primary"
          className="!h-auto gap-2 rounded-[10px] px-5 py-3 text-base leading-5 font-medium"
          data-umami-event="classrooms-invite-student"
        >
          <Plus className="fill-text-on-accent size-4 shrink-0" />
          {t('invite')}
        </Button>
      </ModalInvitation>
    </div>
  );
};
