import { useLayoutEffect, useState } from 'react';
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
import { InvitationDataT } from '../types';
import { toast } from 'sonner';
import { useInvitationsList, useAddInvitation, useDeleteInvitation } from 'common.services';

export const ModalInvitation = ({ children }: { children: React.ReactNode }) => {
  const { data } = useInvitationsList();
  const { addInvitationConfirm } = useAddInvitation();
  const { deleteInvitationConfirm } = useDeleteInvitation();

  const isAdding = addInvitationConfirm.isPending;
  const isDeleting = deleteInvitationConfirm.isPending;

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleCopyLink = (link: InvitationDataT['code']) => () => {
    navigator.clipboard.writeText(link);
    toast('Ссылка скопирована');
  };

  const handleAddInvitation = () => {
    addInvitationConfirm.mutate();
  };

  const handleDeleteInvitation = (id: number) => () => {
    setDeletingId(id);
    deleteInvitationConfirm.mutate(id, {
      onSettled: () => setDeletingId(null),
    });
  };

  useLayoutEffect(() => {
    if (data?.length === 0) {
      handleAddInvitation();
    }
  }, [data?.length]);

  return (
    <Modal>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="max-w-[600px]">
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle>Индивидуальные приглашения</ModalTitle>
        </ModalHeader>

        <ModalBody className="px-4 py-2">
          <Table>
            <caption className="p-2 text-left">
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
                      <span>{invitation.code}</span>
                      <div
                        className="bg-gray-5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm p-1"
                        onClick={handleCopyLink(invitation.code)}
                      >
                        <Copy />
                      </div>
                    </TableCell>
                    <TableCell className="flex max-w-[50%] flex-1">
                      {invitation.usage_count}
                    </TableCell>
                    <TableCell
                      className="flex h-8 w-8 cursor-pointer items-center justify-center p-0"
                      onClick={handleDeleteInvitation(invitation.id)}
                    >
                      {isDeleting && deletingId === invitation.id ? (
                        <div
                          className="text-brand-80 inline-block size-4 animate-spin rounded-full border-[2px] border-current border-t-transparent"
                          role="status"
                          aria-label="loading"
                        />
                      ) : (
                        <Trash size="sm" className="fill-gray-60 hidden group-hover:flex" />
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
