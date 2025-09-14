import { useLayoutEffect, useState, useCallback } from 'react';
import {
  Modal,
  ModalTitle,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalTrigger,
  ModalCloseButton,
} from '@xipkg/modal';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from 'features.table';
import { Button } from '@xipkg/button';
import { Trash, Copy } from '@xipkg/icons';
import { toast } from 'sonner';
import { useInvitationsList, useAddInvitation, useDeleteInvitation } from 'common.services';
import { InvitationDataT } from 'common.types';
import { env } from 'common.env';

export const ModalInvitation = ({ children }: { children: React.ReactNode }) => {
  const { data } = useInvitationsList();

  const { isPending: isAdding, mutate: addInvitationMutate } = useAddInvitation();
  const { isPending: isDeleting, mutate: deleteInvitationMutate } = useDeleteInvitation();

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleCopyLink = (link: InvitationDataT['code']) => () => {
    navigator.clipboard.writeText(`${env.VITE_APP_DOMAIN}/invite/${link}`);
    toast.success('Ссылка скопирована');
    toast.info('Отправьте ссылку ученику');
  };

  const handleAddInvitation = useCallback(() => {
    addInvitationMutate();
  }, [addInvitationMutate]);

  const handleDeleteInvitation = (id: number) => () => {
    setDeletingId(id);
    deleteInvitationMutate(id, {
      onSettled: () => setDeletingId(null),
    });
  };

  useLayoutEffect(() => {
    if (data?.length === 0) {
      handleAddInvitation();
    }
  }, [data?.length, handleAddInvitation]);

  return (
    <Modal>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="max-w-[600px]">
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle className="dark:text-gray-100">Индивидуальные приглашения</ModalTitle>
        </ModalHeader>

        <ModalBody className="px-4 py-2">
          <Table>
            <caption className="p-2 text-left dark:text-gray-100">
              Скопируйте ссылку-приглашение и отправьте ученику
            </caption>
            <TableHeader>
              <TableRow className="flex justify-between">
                <TableHead className="text-gray-80 flex-1 text-sm">Ссылка</TableHead>
                <TableHead className="text-gray-80 flex-1 text-sm">Использований</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data &&
                data.map((invitation: InvitationDataT) => (
                  <TableRow
                    key={invitation.id}
                    className="hover:bg-gray-5 group flex max-h-[38px] flex-row items-center rounded-lg"
                  >
                    <TableCell className="flex max-w-[50%] flex-1 items-center gap-2 overflow-hidden">
                      <span className="dark:text-gray-80">{invitation.code}</span>
                      <div
                        className="bg-gray-5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm p-1"
                        onClick={handleCopyLink(invitation.code)}
                      >
                        <Copy className="dark:fill-gray-80" />
                      </div>
                    </TableCell>
                    <TableCell className="dark:text-gray-80 flex max-w-[50%] flex-1">
                      {invitation.usage_count}
                    </TableCell>
                    <TableCell
                      className="flex h-8 w-8 cursor-pointer items-center justify-center p-0"
                      onClick={handleDeleteInvitation(invitation.id)}
                    >
                      {isDeleting && deletingId === invitation.id ? (
                        <div
                          className="text-brand-80 size-4 animate-spin rounded-full border-[2px] border-current border-t-transparent"
                          role="status"
                          aria-label="loading"
                        />
                      ) : (
                        <Trash size="sm" className="fill-gray-60 group-hover:flex" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </ModalBody>

        <ModalFooter>
          {data?.length > 9 ? (
            <Button variant="ghost">Максимум 10 приглашений</Button>
          ) : (
            <Button
              onClick={handleAddInvitation}
              variant={isAdding && data?.length > 0 ? 'ghost-spinner' : 'default'}
              className="gap-2"
            >
              Создать новое приглашение
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
