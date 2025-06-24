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
import { invitationsMock } from '../mocks';
import { InvitationDataT } from '../types';
import { toast } from 'sonner';

export const ModalInvitation = ({ children }: { children: React.ReactNode }) => {
  const handleCopyLink = (link: InvitationDataT['link']) => () => {
    navigator.clipboard.writeText(link);
    toast('Ссылка скопирована');
  };

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
            <TableHeader>
              <h3 className="p-2">Скопируйте ссылку-приглашение и отправьте ученику</h3>
            </TableHeader>
            <TableRow className="flex justify-between">
              <TableHead className="text-gray-80 flex-1 text-sm">Ссылка</TableHead>
              <TableHead className="text-gray-80 flex-1 text-sm">Использований</TableHead>
              <TableHead className="w-8" />
            </TableRow>
            <TableBody>
              {invitationsMock.map((invitation) => (
                <TableRow
                  key={invitation.id}
                  className="hover:bg-gray-5 group flex max-h-[38px] flex-row items-center rounded-lg"
                >
                  <TableCell className="flex max-w-[50%] flex-1 items-center gap-2 overflow-hidden">
                    <span>{invitation.link}</span>
                    <div
                      className="bg-gray-5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm"
                      onClick={handleCopyLink(invitation.link)}
                    >
                      <Copy className="h-3 w-3" />
                    </div>
                  </TableCell>
                  <TableCell className="flex max-w-[50%] flex-1">{invitation.timesUsed}</TableCell>
                  <TableCell className="flex h-8 w-8 cursor-pointer items-center justify-center p-0">
                    <Trash size="sm" className="fill-gray-60 hidden group-hover:flex" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ModalBody>

        <ModalFooter>
          <Button>Создать новое приглашение</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
