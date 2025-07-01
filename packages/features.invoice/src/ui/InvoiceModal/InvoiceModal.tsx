import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalCloseButton,
} from '@xipkg/modal';
import { Form } from '@xipkg/form';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import { useInvoiceForm } from './hooks';
import { StudentSelector, SubjectSelector, SubjectRow } from './components';
import type { FormData } from '../../model';

type InvoiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const InvoiceModal = ({ open, onOpenChange }: InvoiceModalProps) => {
  const {
    form,
    control,
    handleSubmit,
    selectedSubjects,
    selectedData,
    fields,
    totalInvoicePrice,
    handleChangeStudent,
    handleAddSubject,
    handleRemoveSubject,
    handleSubjectChange,
    handleClearForm,
    onSubmit,
  } = useInvoiceForm();

  const totalLessons = selectedSubjects.reduce((acc, subj) => acc + subj.unpaidLessonsAmount, 0);

  const handleCloseModal = () => {
    handleClearForm();
    onOpenChange(false);
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
    handleCloseModal();
  };

  return (
    <Modal open={open} onOpenChange={handleCloseModal}>
      <ModalContent className="max-w-[800px] md:w-[800px]">
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0" />
        </ModalCloseButton>
        <ModalHeader className="border-gray-20 border-b">
          <ModalTitle>Создание счета на оплату</ModalTitle>
        </ModalHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="p-6">
            <div className="pb-6">
              <p className="text-gray-100">Вы создаёте и отправляете счёт.</p>
              <p className="text-gray-100">
                Ученик оплачивает счёт напрямую вам — переводом или наличными.
              </p>
            </div>

            <StudentSelector control={control} onStudentChange={handleChangeStudent} />

            <SubjectSelector
              control={control}
              values={selectedSubjects.map((subj) => subj.name)}
              suggestions={selectedData.subjects.map((subj) => subj.name)}
              onRemoveItem={handleRemoveSubject}
              onSelectItem={handleAddSubject}
            />

            <div>
              <div className="text-gray-60 grid grid-cols-[2fr_1fr_auto_1fr_auto_1fr] items-center gap-4 text-sm">
                <span>Занятия</span>
                <span>Стоимость</span>
                <div />
                <span>Количество</span>
                <div />
                <span>Сумма</span>
              </div>
              <div className="my-4">
                {selectedData.student ? (
                  fields.map((field, index) => (
                    <SubjectRow
                      key={field.id}
                      control={control}
                      index={index}
                      subject={selectedSubjects[index]}
                      onSubjectChange={handleSubjectChange}
                    />
                  ))
                ) : (
                  <div className="text-gray-30 flex w-full justify-center py-4">
                    Выберите студента
                  </div>
                )}
                <div className="grid grid-cols-[2fr_1fr_auto_1fr_auto_1fr] items-center gap-4">
                  <div />
                  <span className="text-right">Итого:</span>
                  <div />
                  <span>{totalLessons}</span>
                  <div />
                  <span className="text-right">{totalInvoicePrice} ₽</span>
                </div>
              </div>
            </div>

            <ModalFooter className="border-gray-20 flex gap-2 border-t px-0">
              <Button type="submit" size="m">
                Создать
              </Button>
              <Button size="m" variant="secondary" onClick={handleCloseModal}>
                Отменить
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
