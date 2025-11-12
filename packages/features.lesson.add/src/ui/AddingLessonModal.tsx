import { useState } from 'react';
import { Modal, ModalContent, ModalTitle, ModalFooter, ModalCloseButton } from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';

import { DayCalendar } from './DayCalendar';
import { AddingForm } from './components/AddingForm';

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
      <ModalContent className="z-30 max-w-[1100px] p-4 sm:w-[700px] lg:w-[1100px]">
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0 dark:fill-gray-100" />
        </ModalCloseButton>
        <div className="flex justify-between gap-8">
          <div className="w-full">
            <DayCalendar day={eventDate} />
          </div>
          <div className="w-full">
            <ModalTitle className="mb-4 p-0 dark:text-gray-100">Назначение занятия</ModalTitle>

            <AddingForm onClose={handleCloseModal} onDateChange={setEventDate}>
              <ModalFooter className="flex justify-end gap-4 px-0">
                <Button className="w-[128px] rounded-2xl" size="m" variant="secondary" type="reset">
                  Отменить
                </Button>
                <Button className="w-[128px] rounded-2xl" type="submit" size="m">
                  Назначить
                </Button>
              </ModalFooter>
            </AddingForm>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
