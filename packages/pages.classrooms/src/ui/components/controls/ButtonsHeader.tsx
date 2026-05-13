import { Button } from '@xipkg/button';
import { ModalInvitation } from 'features.invites';
import { ModalAddGroup } from 'features.group.add';

export const ButtonsHeader = () => {
  return (
    <div className="ml-2 flex flex-row items-center gap-2 pr-4 max-sm:hidden md:ml-0 md:pr-0">
      <ModalAddGroup>
        <Button
          variant="ghost"
          size="s"
          className="rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
          data-umami-event="classrooms-create-group"
        >
          Создать группу
        </Button>
      </ModalAddGroup>
      <ModalInvitation>
        <Button
          size="s"
          className="text-s-base text-gray-0 rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
          data-umami-event="classrooms-invite-student"
        >
          Пригласить
        </Button>
      </ModalInvitation>
    </div>
  );
};
