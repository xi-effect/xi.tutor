import { Button } from '@xipkg/button';
import { ModalInvitation } from 'features.invites';
import { ModalAddGroup } from 'features.group.add';
import { useCurrentUser } from 'common.services';

export const ActionButtons = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  if (!isTutor) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-center gap-2 px-4 pt-4 pb-2">
      <ModalAddGroup>
        <Button
          id="create-group-button"
          variant="none"
          size="s"
          className="text-s-base border-gray-30 rounded-lg border px-4 py-2 font-medium"
          data-umami-event="main-create-group"
        >
          Создать группу
        </Button>
      </ModalAddGroup>

      <ModalInvitation>
        <Button
          id="invite-student-button"
          size="s"
          variant="secondary"
          className="rounded-lg px-4 py-2 font-medium"
          data-umami-event="main-invite-student"
        >
          Добавить ученика
        </Button>
      </ModalInvitation>
    </div>
  );
};
