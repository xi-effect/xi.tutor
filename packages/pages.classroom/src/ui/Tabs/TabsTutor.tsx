/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState } from 'react';
import { Tabs } from '@xipkg/tabs';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { useSearch, useNavigate, useParams } from '@tanstack/react-router';
import { Plus } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { ActionButton } from '@xipkg/actionbutton';
import { Overview } from '../Overview';
import { SearchParams } from '../../types/router';
import { InformationLayout } from '../Information';
import { MaterialsAdd } from 'features.materials.add';
import { Payments } from '../Payments';
import { Materials } from '../Materials';
import { useGetClassroom, useAddClassroomMaterials } from 'common.services';
import { ModalStudentsGroup } from 'features.group.manage';
import { ModalGroupInvite } from 'features.group.invite';
import { InvoiceModal } from 'features.invoice';
import { useMedia } from 'common.utils';

const tabs = [
  { id: 'overview', label: 'Сводка' },
  { id: 'materials', label: 'Материалы' },
  { id: 'payments', label: 'Оплаты' },
  { id: 'info', label: 'Информация' },
];

export const TabsTutor = () => {
  const isMobile = useMedia('(max-width: 720px)');

  const search: SearchParams = useSearch({ strict: false });
  const navigate = useNavigate();
  const currentTab = search.tab || 'overview';
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [isGroupInviteModalOpen, setIsGroupInviteModalOpen] = useState(false);
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data: classroom } = useGetClassroom(Number(classroomId));
  const { addClassroomMaterials } = useAddClassroomMaterials();

  const handleAddMaterial = (
    contentKind: 'note' | 'board',
    studentAccessMode: 'no_access' | 'read_only' | 'read_write',
  ) => {
    if (!classroomId) return;
    addClassroomMaterials.mutate(
      { classroomId, content_kind: contentKind, student_access_mode: studentAccessMode },
      {
        onSuccess: (response) => {
          if (contentKind === 'note') {
            navigate({
              to: '/classrooms/$classroomId/notes/$noteId',
              params: { classroomId, noteId: response.data.id },
            });
          } else {
            navigate({
              to: '/classrooms/$classroomId/boards/$boardId',
              params: { classroomId, boardId: response.data.id },
            });
          }
        },
      },
    );
  };

  const handleTabChange = (value: string) => {
    // Сохраняем параметр call при смене табов
    const filteredSearch = search.call ? { call: search.call } : {};

    navigate({
      // @ts-ignore
      search: {
        // @ts-ignore
        tab: value,
        ...filteredSearch,
      },
    });
  };

  return (
    <div className="bg-gray-0 h-[calc(100vh-88px)] rounded-tl-2xl px-4 pt-0">
      <Tabs.Root value={currentTab} onValueChange={handleTabChange}>
        <div className="flex h-[56px] flex-row items-center gap-4 overflow-x-auto px-4 md:p-0">
          <SwitcherAnimate
            tabs={tabs}
            activeTab={currentTab}
            onChange={handleTabChange}
            className="bg-gray-5 flex flex-row gap-4 max-sm:w-full"
            tabClassName="text-m-base font-medium text-gray-100"
          />
          {currentTab === 'overview' && !isMobile && classroom?.kind === 'group' && (
            <ModalStudentsGroup>
              <Button
                size="s"
                variant="none"
                className="ml-auto rounded-lg"
                data-umami-event="classroom-add-student"
              >
                Добавить ученика
              </Button>
            </ModalStudentsGroup>
          )}
          {currentTab === 'overview' && !isMobile && classroom?.kind === 'group' && (
            <ModalGroupInvite>
              <Button
                size="s"
                variant="none"
                className="ml-1 rounded-lg"
                data-umami-event="classroom-invite-to-group"
              >
                Пригласить в группу
              </Button>
            </ModalGroupInvite>
          )}
          {currentTab === 'materials' && !isMobile && <MaterialsAdd />}
          {currentTab === 'payments' && !isMobile && (
            <Button
              size="s"
              className="ml-auto w-8 rounded-lg px-2 py-2 font-medium sm:w-auto sm:px-4"
              onClick={() => setIsInvoiceModalOpen(true)}
              data-umami-event="classroom-create-invoice"
            >
              <span className="hidden sm:flex">Создать счёт на оплату</span>
              <Plus size="sm" className="fill-brand-0 flex sm:hidden" />
            </Button>
          )}
        </div>
        <div className="pt-0">
          <Tabs.Content value="overview">
            <Overview />
          </Tabs.Content>

          <Tabs.Content value="materials">
            <Materials />
          </Tabs.Content>

          <Tabs.Content value="payments">
            <Payments />
          </Tabs.Content>

          <Tabs.Content value="info">
            <InformationLayout />
          </Tabs.Content>
        </div>
        {isInvoiceModalOpen && (
          <InvoiceModal open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen} />
        )}
        {isMobile && (
          <>
            <ActionButton
              classname="fixed bottom-5 right-4 z-50 h-[64px] w-[64px] rounded-2xl"
              dropdownContentProps={{ className: 'w-auto py-2' }}
            >
              {({ MenuItem }) => (
                <>
                  {currentTab === 'overview' && classroom?.kind === 'group' && (
                    <>
                      <MenuItem
                        className="h-[48px] rounded-xl px-4 text-[22px]"
                        data-umami-event="classroom-add-student"
                        onClick={() => setIsStudentsModalOpen(true)}
                      >
                        Добавить ученика
                      </MenuItem>
                      <MenuItem
                        className="h-[48px] rounded-xl px-4 text-[22px]"
                        data-umami-event="classroom-invite-to-group"
                        onClick={() => setIsGroupInviteModalOpen(true)}
                      >
                        Пригласить в группу
                      </MenuItem>
                    </>
                  )}
                  {currentTab === 'materials' && (
                    <>
                      <MenuItem
                        className="h-[48px] rounded-xl px-4 text-[22px]"
                        onClick={() => handleAddMaterial('note', 'read_write')}
                        disabled={addClassroomMaterials.isPending}
                        data-umami-event="material-create-note"
                        data-umami-event-access-mode="read_write"
                      >
                        Заметка: Совместная работа
                      </MenuItem>
                      <MenuItem
                        className="h-[48px] rounded-xl px-4 text-[22px]"
                        onClick={() => handleAddMaterial('note', 'read_only')}
                        disabled={addClassroomMaterials.isPending}
                        data-umami-event="material-create-note"
                        data-umami-event-access-mode="read_only"
                      >
                        Заметка: Только репетитор
                      </MenuItem>
                      <MenuItem
                        className="h-[48px] rounded-xl px-4 text-[22px]"
                        onClick={() => handleAddMaterial('note', 'no_access')}
                        disabled={addClassroomMaterials.isPending}
                        data-umami-event="material-create-note"
                        data-umami-event-access-mode="no_access"
                      >
                        Заметка: Черновики
                      </MenuItem>
                      <MenuItem
                        className="h-[48px] rounded-xl px-4 text-[22px]"
                        onClick={() => handleAddMaterial('board', 'read_write')}
                        disabled={addClassroomMaterials.isPending}
                        data-umami-event="material-create-board"
                        data-umami-event-access-mode="read_write"
                      >
                        Доска: Совместная работа
                      </MenuItem>
                      <MenuItem
                        className="h-[48px] rounded-xl px-4 text-[22px]"
                        onClick={() => handleAddMaterial('board', 'read_only')}
                        disabled={addClassroomMaterials.isPending}
                        data-umami-event="material-create-board"
                        data-umami-event-access-mode="read_only"
                      >
                        Доска: Только репетитор
                      </MenuItem>
                      <MenuItem
                        className="h-[48px] rounded-xl px-4 text-[22px]"
                        onClick={() => handleAddMaterial('board', 'no_access')}
                        disabled={addClassroomMaterials.isPending}
                        data-umami-event="material-create-board"
                        data-umami-event-access-mode="no_access"
                      >
                        Доска: Черновики
                      </MenuItem>
                    </>
                  )}
                  {currentTab === 'payments' && (
                    <MenuItem
                      className="h-[48px] w-full rounded-xl px-4 text-[22px]"
                      onClick={() => setIsInvoiceModalOpen(true)}
                      data-umami-event="classroom-create-invoice"
                    >
                      Создать счёт на оплату
                    </MenuItem>
                  )}
                </>
              )}
            </ActionButton>
            <ModalStudentsGroup open={isStudentsModalOpen} onOpenChange={setIsStudentsModalOpen} />
            <ModalGroupInvite
              open={isGroupInviteModalOpen}
              onOpenChange={setIsGroupInviteModalOpen}
            />
          </>
        )}
      </Tabs.Root>
    </div>
  );
};
