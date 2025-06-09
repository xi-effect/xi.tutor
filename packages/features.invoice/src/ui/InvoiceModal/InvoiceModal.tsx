import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalCloseButton,
} from '@xipkg/modal';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@xipkg/select';
import { Input } from '@xipkg/input';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';

type InvoiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const InvoiceModal = ({ open, onOpenChange }: InvoiceModalProps) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="w-[800px]">
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0" />
        </ModalCloseButton>
        <ModalHeader>
          <ModalTitle>Создание счета на оплату</ModalTitle>
        </ModalHeader>
        <div className="p-6">
          <div className="pb-6">
            <p className="text-gray-100">Вы создаёте и отправляете счёт.</p>
            <p className="text-gray-100">
              Ученик оплачивает счёт напрямую вам — переводом или наличными.
            </p>
          </div>

          <div className="pb-6">
            <p>Ученик или группа</p>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Petrov">Алексей Петров</SelectItem>
                <SelectItem value="group">Группа 10А</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pb-6">
            <Input placeholder="Сумма" />
          </div>
        </div>

        <ModalFooter className="border-gray-20 flex gap-2 border-t">
          <Button size="m">Создать</Button>
          <Button size="m" variant="secondary" onClick={() => onOpenChange(false)}>
            Отменить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
