import { Modal, ModalContent, ModalBody } from '@xipkg/modal';
import { Button } from '@xipkg/button';

/** Одиночное занятие — две кнопки (отмена + закрыть). Серия — три («только это», «это и следующие», закрыть). */
export type CancelLessonVariant = 'sole' | 'recurring';

export type CancelLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** По умолчанию «повторяющееся» (три кнопки), как раньше */
  variant?: CancelLessonVariant;
  /** Одно занятие / только это из серии */
  onCancelOne: () => void;
  /** Серия целиком (только для variant recurring) */
  onCancelAll: () => void;
};

export const CancelLessonModal = ({
  open,
  onOpenChange,
  variant = 'recurring',
  onCancelOne,
  onCancelAll,
}: CancelLessonModalProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="w-full max-w-[480px]">
        <ModalBody className="flex flex-col items-center gap-4 p-6">
          <h3 className="text-xl-base font-semibold text-gray-100">Отменить занятие?</h3>
          <p className="text-m-base text-gray-60 text-center">
            Занятие нельзя будет восстановить после отмены
          </p>

          {variant === 'sole' ? (
            <>
              <Button className="w-full" variant="primary" size="m" onClick={onCancelOne}>
                Отменить занятие
              </Button>
              <Button
                variant="none"
                size="m"
                className="text-m-base w-full cursor-pointer font-semibold text-gray-100"
                onClick={handleClose}
              >
                Закрыть
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
