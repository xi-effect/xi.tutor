import { Button } from '@xipkg/button';
import { ModalInvitation } from 'features.invites';
import { ModalAddGroup } from 'features.group.add';
import { useCurrentUser } from 'common.services';
import { Group, UserPlus } from '@xipkg/icons';

export const ActionButtons = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  if (!isTutor) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-center gap-2">
      <ModalAddGroup>
        <Button
          id="create-group-button"
          variant="none"
          size="m"
          className="bg-gray-0 text-s-base text-gray-90 w-full rounded-xl border-none font-medium"
          data-umami-event="main-create-group"
        >
          <Group className="fill-gray-90 mr-3" />
          Создать группу
        </Button>
      </ModalAddGroup>

      <ModalInvitation>
        <Button
          id="invite-student-button"
          size="m"
          variant="primary"
          className="w-full rounded-xl font-medium"
          data-umami-event="main-invite-student"
        >
          <UserPlus className="fill-gray-0 text-gray-0 mr-3" />
          Добавить ученика
        </Button>
      </ModalInvitation>
    </div>
  );
};
