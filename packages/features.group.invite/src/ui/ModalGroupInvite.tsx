import {
  Modal,
  ModalTitle,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalTrigger,
  ModalCloseButton,
  ModalDescription,
  ModalFooter,
} from '@xipkg/modal';

import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@xipkg/dropdown';

import { useParams } from '@tanstack/react-router';
import { toast } from 'sonner';
import { env } from 'common.env';
import { Input } from '@xipkg/input';
import { MoreVert } from '@xipkg/icons';
import { useGroupInvite } from '../services/useGroupInvite';
import { useGetClassroom } from 'common.services';
import { useResetGroupInvite } from '../services/useResetGroupInvite';

type ModalGroupInviteProps = {
  children: React.ReactNode;
};

export const ModalGroupInvite = ({ children }: ModalGroupInviteProps) => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data, isLoading } = useGroupInvite({ classroomId: classroomId });
  const { data: classroom } = useGetClassroom(Number(classroomId));
  const { mutate: resetInvite, isPending: isResettingInvite } = useResetGroupInvite({
    classroom_id: classroomId,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${env.VITE_APP_DOMAIN}/invite/${data?.code}`);
    toast.success('Ссылка скопирована');
    toast.info('Отправьте ссылку ученикам');
  };

  const handleResetInvite = () => {
    resetInvite(undefined, {
      onSuccess: () => {
        toast.success('Ссылка сброшена');
      },
    });
  };

  return (
    <Modal>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="max-w-[600px]">
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle className="dark:text-gray-100">Приглашение в группу</ModalTitle>
          <ModalDescription>
            Отправьте ссылку ученикам, чтобы пригласить их в группу
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="flex w-full flex-col gap-2 p-6">
          <div className="flex w-full flex-row items-center justify-center gap-2">
            <div className="flex w-full items-center justify-center">
              {isLoading || isResettingInvite ? (
                <div
                  className="text-brand-80 inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent"
                  role="status"
                  aria-label="loading"
                >
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <div className="w-full">
                  <Input
                    className="w-full cursor-pointer"
                    type="text"
                    placeholder="Ссылка"
                    value={`${env.VITE_APP_DOMAIN}/invite/${data?.code}`}
                    onClick={handleCopyLink}
                    readOnly
                    data-umami-event="group-invite-copy-link-input"
                  />
                </div>
              )}
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-12 w-12"
                    variant="ghost"
                    size="icon"
                    data-umami-event="group-invite-menu-open"
                  >
                    <MoreVert className="h-6 w-6 fill-gray-100" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  align="end"
                  className="border-gray-10 bg-gray-0 border p-1"
                >
                  <DropdownMenuItem
                    onClick={handleResetInvite}
                    data-umami-event="group-invite-reset"
                  >
                    Сбросить ссылку
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                    Деактивировать ссылку
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {classroom &&
            classroom.kind === 'group' &&
            classroom?.enrollments_count !== undefined &&
            !isLoading && (
              <div className="text-xs-base flex flex-col gap-2 text-green-100">
                Cтудентов в кабинете: {classroom?.enrollments_count} из 15
              </div>
            )}
        </ModalBody>
        <ModalFooter className="flex gap-2">
          <Button onClick={handleCopyLink} data-umami-event="group-invite-copy-link-button">
            Копировать ссылку
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
