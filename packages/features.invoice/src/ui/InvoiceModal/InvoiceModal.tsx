import { useMemo, useState } from 'react';
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
import { Close, CrossCircle } from '@xipkg/icons';

import { students } from '../../mocks';
import type { StudentT, SubjectT } from '../../types/InvoiceTypes';

type InvoiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const InvoiceModal = ({ open, onOpenChange }: InvoiceModalProps) => {
  const [activeStudent, setActiveStudent] = useState<StudentT | null>(null);
  const [activeSubjects, setActiveSubjects] = useState<SubjectT[]>([]);
  const [inputValue, setInputValue] = useState('');

  const suggestions = useMemo(() => {
    if (!inputValue || !activeStudent) return [];
    return activeStudent.subjects.filter((subject) => {
      const subjectName = subject.name.toLowerCase();
      return (
        subjectName.includes(inputValue.toLowerCase()) &&
        !activeSubjects.some((subj) => subj.id === subject.id)
      );
    });
  }, [inputValue, activeStudent, activeSubjects]);

  const handleChangeStudent = (id: string) => {
    const student = students.find((student) => student.id === id);
    setActiveStudent(student || null);
    setActiveSubjects(student?.subjects || []);
  };

  const handleChangeSubject = (id: string) => {
    setActiveSubjects((prev) => {
      if (!activeStudent) return prev;
      const subject = activeStudent.subjects.find((subject) => subject.id === id);
      if (subject) {
        return [...prev, subject];
      }
      return prev;
    });
    setInputValue('');
  };

  const handleRemoveItem = (itemId: string) => {
    setActiveSubjects(activeSubjects.filter((subj) => subj.id !== itemId));
  };

  const handleCancel = () => {
    setActiveStudent(null);
    setActiveSubjects([]);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="md:w-[800px]">
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
            <p className="mb-2">Ученик или группа</p>
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
          <div className="relative pb-6">
            <p className="mb-2">Предметы</p>
            <div className="w-full rounded-lg border border-gray-300 bg-white px-3">
              <div className="flex flex-wrap items-center gap-2">
                {activeSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="bg-gray-5 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-gray-100"
                  >
                    <span>{subject.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(subject.id)}
                      className="p-0 hover:bg-transparent"
                    >
                      <CrossCircle className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Input
                  value={inputValue}
                  placeholder={activeSubjects.length > 0 ? '' : 'Введите предметы через запятую'}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full border-none p-0 outline-none"
                />
              </div>
            </div>
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                <ul className="py-1">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      onClick={() => handleChangeSubject(suggestion.id)}
                      className={`cursor-pointer px-4 py-2 text-gray-900 hover:bg-gray-50`}
                    >
                      {suggestion.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pb-6">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4">
              <span>Занятия</span>
              <span>Стоимость</span>
              <span>Количество</span>
              <span>Сумма</span>
            </div>
            <div className="grid grid-cols-[2fr_1fr_auto_1fr_auto_1fr] gap-4">
              <div>
                <p>Занятие на 40 минут</p>
                <p>Неоплаченных: 1</p>
              </div>
              <Input type="number" placeholder="Стоимость" after={<span>₽</span>} />
              <span>x</span>
              <Input type="number" placeholder="Раз" />
              <span>=</span>
              <Input type="number" placeholder="Сумма" after={<span>₽</span>} readOnly />
            </div>
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
