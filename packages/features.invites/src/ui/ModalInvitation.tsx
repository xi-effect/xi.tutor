import { useState, useCallback, useEffect, useRef } from 'react';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { toast } from 'sonner';
import { useInvitationsList, useAddInvitation, useDeleteInvitation } from 'common.services';
import { InvitationDataT } from 'common.types';
import { env } from 'common.env';

type InviteAnalyticsSource = 'main' | 'classrooms' | 'classroom' | 'unknown';

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

type ModalInvitationProps = {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  analyticsSource?: InviteAnalyticsSource;
};

export const ModalInvitation = ({
  children,
  open: controlledOpen,
  onOpenChange,
  analyticsSource = 'unknown',
}: ModalInvitationProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (value: boolean) => onOpenChange?.(value) : setInternalOpen;

  const handleClose = () => {
    setOpen(false);
    cleanupBodyScrollLock();
  };

  useEffect(() => {
    if (open === false) cleanupBodyScrollLock();
    return cleanupBodyScrollLock;
  }, [open]);

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
    addInvitationMutate({ source: analyticsSource });
  }, [addInvitationMutate, analyticsSource]);

  const handleDeleteInvitation = (id: number) => () => {
    setDeletingId(id);
    deleteInvitationMutate(id, {
      onSettled: () => setDeletingId(null),
    });
  };

  const hasAutoCreated = useRef(false);

  useEffect(() => {
    if (data?.length === 0 && !hasAutoCreated.current) {
      hasAutoCreated.current = true;
      handleAddInvitation();
    }
  }, [data?.length, handleAddInvitation]);

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (typeof next === 'boolean') setOpen(next);
        if (next === false) cleanupBodyScrollLock();
      }}
    >
      {children != null && <ModalTrigger asChild>{children}</ModalTrigger>}
      <ModalContent className="max-w-[600px]" aria-describedby={undefined}>
        <ModalHeader>
          <ModalCloseButton onClick={handleClose} />
          <ModalTitle className="max-w-[calc(100%-48px)] text-gray-100">
            Индивидуальные приглашения
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="px-4 py-2">
          <p className="flex flex-wrap items-center gap-1.5 px-2 pb-2 text-left dark:text-gray-100">
            <span>Скопируйте ссылку-приглашение</span>
            <Copy size="sm" className="fill-gray-60 size-4 shrink-0" aria-hidden />
            <span>и отправьте ученику</span>
          </p>
          <Table>
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
                      <span className="dark:text-gray-80 truncate">{invitation.code}</span>
                      <Tooltip delayDuration={400}>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="none"
                            size="s"
                            className="bg-gray-5 hover:bg-gray-10 text-gray-60 hover:text-gray-80 size-7 shrink-0 rounded-md p-0"
                            onClick={handleCopyLink(invitation.code)}
                            aria-label="Копировать ссылку"
                            data-umami-event="invite-copy-link"
                            data-umami-event-invite-id={invitation.id}
                          >
                            <Copy size="sm" className="size-4 fill-current" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Копировать ссылку</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="dark:text-gray-80 flex max-w-[50%] flex-1">
                      {invitation.usage_count}
                    </TableCell>
                    <TableCell
                      className="flex h-8 w-8 cursor-pointer items-center justify-center p-0"
                      onClick={handleDeleteInvitation(invitation.id)}
                      data-umami-event="invite-delete"
                      data-umami-event-invite-id={invitation.id}
                    >
                      {isDeleting && deletingId === invitation.id ? (
                        <div
                          className="text-brand-80 size-4 animate-spin rounded-full border-[2px] border-current border-t-transparent"
                          role="status"
                          aria-label="loading"
                        />
                      ) : (
                        <Trash size="sm" className="fill-gray-60 h-6 w-6 group-hover:flex" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </ModalBody>

        <ModalFooter>
          {data?.length > 9 ? (
            <Button variant="none">Максимум 10 приглашений</Button>
          ) : (
            <Button
              onClick={handleAddInvitation}
              variant="primary"
              className="gap-2"
              data-umami-event="invite-create"
              loading={isAdding && data?.length > 0}
            >
              Создать новое приглашение
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
