import { useState } from 'react';
import { ActionButton } from '@xipkg/actionbutton';
import { ModalInvitation } from 'features.invites';
import { ModalAddGroup } from 'features.group.add';

import { ButtonsHeader, LinkListStudents, CardsGridSimple } from './components';
import { useCurrentUser } from 'common.services';

export const ClassroomsPage = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);

  return (
    <div className="bg-gray-5 flex h-screen flex-col justify-between gap-6 pr-0 pl-4">
      <div className="flex h-screen flex-col">
        <div className="flex flex-row items-center pt-6 pr-6 pb-4 pl-4">
          <h1 className="text-2xl font-normal text-gray-100">Кабинеты</h1>

          <div className="mr-2 ml-auto flex items-center">
            {isTutor && <LinkListStudents src="#" />}
          </div>

          {isTutor && <ButtonsHeader />}
        </div>

        <CardsGridSimple />
      </div>

      {isTutor && (
        <div className="fixed right-4 bottom-5 z-50 sm:hidden">
          <ActionButton
            classname="h-[64px] w-[64px] rounded-2xl"
            dropdownContentProps={{ className: 'w-auto py-2' }}
          >
            {({ MenuItem }) => (
              <>
                <MenuItem
                  className="h-[48px] rounded-xl px-4 text-[22px]"
                  onClick={() => setIsInviteModalOpen(true)}
                  data-umami-event="classrooms-invite-student"
                >
                  Пригласить
                </MenuItem>
                <MenuItem
                  className="h-[48px] rounded-xl px-4 text-[22px]"
                  onClick={() => setIsAddGroupModalOpen(true)}
                  data-umami-event="classrooms-create-group"
                >
                  Создать группу
                </MenuItem>
              </>
            )}
          </ActionButton>
          <ModalInvitation open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen} />
          <ModalAddGroup open={isAddGroupModalOpen} onOpenChange={setIsAddGroupModalOpen} />
        </div>
      )}
    </div>
  );
};
