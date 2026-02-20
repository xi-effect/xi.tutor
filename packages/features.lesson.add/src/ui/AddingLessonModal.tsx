import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalCloseButton,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@xipkg/modal';
import { Button } from '@xipkg/button';

import { AddingForm } from './components/AddingForm';
import './AddingModal.css';

type AddingLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const AddingLessonModal = ({ open, onOpenChange }: AddingLessonModalProps) => {
  const handleCloseModal = () => {
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleCloseModal}>
      <ModalContent className="max-w-[600px]">
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle>Назначение урока</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <AddingForm onClose={handleCloseModal} />
        </ModalBody>
        <ModalFooter className="flex flex-row items-center gap-2">
          <Button size="m" variant="secondary" type="reset">
            Отменить
          </Button>
          <Button variant="primary" type="submit" size="m">
            Назначить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
