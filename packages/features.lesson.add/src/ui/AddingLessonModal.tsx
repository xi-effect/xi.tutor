import { useState } from 'react';
import { Modal, ModalContent, ModalFooter, ModalCloseButton } from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';

import { AddingForm } from './components/AddingForm';
import { ModalContentWrapper } from './components/ModalContentWrapper';

import './AddingModal.css';

type AddingLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const AddingLessonModal = ({ open, onOpenChange }: AddingLessonModalProps) => {
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const handleCloseModal = () => {
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleCloseModal}>
      <ModalContent className="z-30 h-screen max-w-[1100px] overflow-hidden p-4 sm:w-[700px] sm:overflow-auto lg:w-[1100px]">
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0 dark:fill-gray-100" />
        </ModalCloseButton>
        <ModalContentWrapper currentDay={eventDate}>
          <AddingForm onClose={handleCloseModal} onDateChange={setEventDate}>
            <ModalFooter className="flex flex-col-reverse items-center justify-center gap-4 p-0 sm:flex-row sm:justify-end sm:py-6">
              <Button
                className="w-full rounded-2xl sm:w-[128px]"
                size="m"
                variant="secondary"
                type="reset"
              >
                Отменить
              </Button>
              <Button className="w-full rounded-2xl sm:w-[128px]" type="submit" size="m">
                Назначить
              </Button>
            </ModalFooter>
          </AddingForm>
        </ModalContentWrapper>
      </ModalContent>
    </Modal>
  );
};
