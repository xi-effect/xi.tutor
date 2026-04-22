import { Modal, ModalContent, ModalBody } from '@xipkg/modal';
import { Button } from '@xipkg/button';

type CancelLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelOne: () => void;
  onCancelAll: () => void;
};

export const CancelLessonModal = ({
  open,
  onOpenChange,
  onCancelOne,
  onCancelAll,
}: CancelLessonModalProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="w-full max-w-[480px]">
        <ModalBody className="flex flex-col items-center gap-4 p-6">
          <h3 className="text-xl-base font-semibold text-gray-100">Отменить занятие?</h3>
          <p className="text-m-base text-gray-60 text-center">
            Занятие нельзя будет восстановить после отмены
          </p>

          <Button className="w-full" variant="primary" size="m" onClick={onCancelOne}>
            Отменить только это занятие
          </Button>
          <Button className="w-full" variant="ghost" size="m" onClick={onCancelAll}>
            Отменить это и все последующие занятия
          </Button>

          <Button
            variant="none"
            size="m"
            className="text-m-base w-full cursor-pointer font-semibold text-gray-100"
            onClick={handleClose}
          >
            Закрыть
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
