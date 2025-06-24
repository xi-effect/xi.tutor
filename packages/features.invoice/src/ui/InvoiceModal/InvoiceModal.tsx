import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalCloseButton,
} from '@xipkg/modal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@xipkg/form';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@xipkg/select';
import { Input } from '@xipkg/input';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import { InputWithHelper } from '../InputWithHelper/InputWithHelper';
import { students } from '../../mocks';
import { formSchema, type FormData } from '../../model';

type InvoiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const InvoiceModal = ({ open, onOpenChange }: InvoiceModalProps) => {
  // const [activeStudent, setActiveStudent] = useState<StudentT | null>(null);
  // const [activeSubjects, setActiveSubjects] = useState<SubjectT[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    // formState: { errors, isValid }
  } = form;

  const selectedStudentId = watch('studentId');
  const selectedSubjNames = watch('subjects');
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [selectedStudentId]);
  const selectedSubjects = useMemo(() => {
    return selectedStudent?.subjects.filter((subj) => selectedSubjNames.includes(subj.name));
  }, [selectedStudent, selectedSubjNames]);

  const handleChangeStudent = (id: string) => {
    setValue('studentId', id);
    // setValue('subjects', id);
  };

  const handleAddSubject = (subjectName: string) => {
    if (!selectedSubjNames.includes(subjectName)) {
      setValue('subjects', [...selectedSubjNames, subjectName], {
        shouldValidate: true,
      });
    }
  };

  // const handleAddSubject = (id: string) => {
  //   setActiveSubjects((prev) => {
  //     if (!activeStudent) return prev;
  //     const subject = activeStudent.subjects.find((subject) => subject.id === id);
  //     if (subject) {
  //       return [...prev, subject];
  //     }
  //     return prev;
  //   });
  // };

  const handleRemoveSubj = (subjName: string) => {
    setValue(
      'subjects',
      selectedSubjNames.filter((subj) => subj !== subjName),
    );
  };

  const handleCancel = () => {
    setValue('studentId', '');
    setValue('subjects', []);
    onOpenChange(false);
  };

  const onSubmit = (data: FormData) => {
    console.log('invoice form data: ', data);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-[800px] md:w-[800px]">
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0" />
        </ModalCloseButton>
        <ModalHeader className="border-gray-20 border-b">
          <ModalTitle>Создание счета на оплату</ModalTitle>
        </ModalHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="p-6">
              <div className="pb-6">
                <p className="text-gray-100">Вы создаёте и отправляете счёт.</p>
                <p className="text-gray-100">
                  Ученик оплачивает счёт напрямую вам — переводом или наличными.
                </p>
              </div>

              <FormField
                control={control}
                name="studentId"
                defaultValue=""
                render={({ field }) => (
                  <FormItem className="pb-6">
                    <FormLabel className="mb-2">Ученик или группа</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => handleChangeStudent(value)}
                      >
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="subjects"
                defaultValue={selectedStudent?.subjects.map((subj) => subj.name) || []}
                render={({ field }) => (
                  <FormItem className="pb-6">
                    <FormLabel className="mb-2">Предметы</FormLabel>
                    <FormControl>
                      <InputWithHelper
                        activeSubjects={field.value}
                        onRemoveItem={handleRemoveSubj}
                        onSelectItem={handleAddSubject}
                        suggestions={selectedStudent?.subjects || []}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="text-gray-60 grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 text-sm">
                  <span>Занятия</span>
                  <span>Стоимость</span>
                  <span>Количество</span>
                  <span>Сумма</span>
                </div>
                <div className="my-4">
                  {selectedStudent ? (
                    selectedSubjects?.map((subject) => (
                      <div
                        key={subject.id}
                        className="mb-4 grid grid-cols-[2fr_1fr_auto_1fr_auto_1fr] items-center"
                      >
                        <div>
                          <p>{subject.variant}</p>
                          <p className="text-gray-60 text-sm">Неоплаченных: 1</p>
                        </div>
                        <Input
                          type="number"
                          value={subject.price}
                          placeholder="Стоимость"
                          variant="s"
                          after={<span>₽</span>}
                        />
                        <span className="mx-2">x</span>
                        <Input type="number" value={1} placeholder="Раз" variant="s" />
                        <span className="mx-2">=</span>
                        <Input
                          type="number"
                          placeholder="Сумма"
                          variant="s"
                          after={<span>₽</span>}
                          readOnly
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-30 flex w-full justify-center py-4">
                      Выберите студента
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ModalFooter className="border-gray-20 flex gap-2 border-t">
              <Button type="submit" size="m">
                Создать
              </Button>
              <Button size="m" variant="secondary" onClick={handleCancel}>
                Отменить
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
