import { useState } from 'react';
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

import { students } from '../../mocks';
import type { StudentT, SubjectT } from '../../types/InvoiceTypes';

type InvoiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const InvoiceModal = ({ open, onOpenChange }: InvoiceModalProps) => {
  const [activeStudent, setActiveStudent] = useState<StudentT | null>(null);
  const [activeSubject, setActiveSubject] = useState<SubjectT | null>(null);

  const handleChangeStudent = (id: string) => {
    setActiveStudent(students.find((student) => student.id === id) || null);
  };

  const handleChangeSubject = (id: string) => {
    setActiveSubject(activeStudent?.subjects.find((subject) => subject.id === id) || null);
  };

  const handleCancel = () => {
    setActiveStudent(null);
    setActiveSubject(null);
    onOpenChange(false);
  };

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
            <Select value={activeStudent?.id} onValueChange={(value) => handleChangeStudent(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pb-6">
            <p>Предметы</p>
            <Select value={activeSubject?.id} onValueChange={(value) => handleChangeSubject(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activeStudent?.subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pb-6">
            <Input placeholder="Сумма" value={activeSubject?.price} />
          </div>
        </div>

        <ModalFooter className="border-gray-20 flex gap-2 border-t">
          <Button size="m">Создать</Button>
          <Button size="m" variant="secondary" onClick={handleCancel}>
            Отменить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
