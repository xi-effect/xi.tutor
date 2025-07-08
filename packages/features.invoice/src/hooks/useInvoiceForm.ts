import { useForm, useFieldArray } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useCallback } from 'react';
import { formSchema, type FormData } from '../model';
import { students } from '../mocks';
import type { SubjectT } from '../types/InvoiceTypes';

export const useInvoiceForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      studentId: '',
      subjects: [],
      invoicePrice: 0,
    },
  });

  const { control, watch, setValue, handleSubmit } = form;

  const selectedStudentId = watch('studentId');
  const selectedSubjects = watch('subjects');

  const { fields } = useFieldArray({
    control,
    name: 'subjects',
  });

  const selectedData = useMemo(() => {
    const student = students.find((s) => s.id === selectedStudentId);
    return { student, subjects: student?.subjects || [] };
  }, [selectedStudentId]);

  const totalInvoicePrice = useMemo(() => {
    return selectedSubjects.reduce((total, subject) => {
      return total + subject.pricePerLesson * (subject.unpaidLessonsAmount || 0);
    }, 0);
  }, [selectedSubjects]);

  const modifySubject = (subject: SubjectT) => {
    const unpaidLessons = subject.unpaidLessonsAmount ? subject.unpaidLessonsAmount + 1 : 1;
    const totalPrice = subject.pricePerLesson * unpaidLessons;
    return { ...subject, unpaidLessonsAmount: unpaidLessons, totalPrice };
  };

  const handleChangeStudent = (id: string) => {
    setValue('studentId', id);
    const newSubjects = selectedData.subjects.map((subj) => modifySubject(subj));
    setValue('subjects', newSubjects);
    setValue('invoicePrice', 0);
  };

  const handleAddSubject = (newSubjName: string) => {
    if (!selectedSubjects.find((subj) => subj.name === newSubjName)) {
      const newSubject = selectedData.subjects.find((subj) => subj.name === newSubjName);
      if (newSubject) {
        const modifiedSubject = modifySubject(newSubject);
        setValue('subjects', [...selectedSubjects, modifiedSubject], {
          shouldValidate: true,
        });
      }
    }
  };

  const handleRemoveSubject = (subjName: string) => {
    setValue(
      'subjects',
      selectedSubjects.filter((subj) => subj.name !== subjName),
    );
  };

  const handleSubjectChange = useCallback(
    (index: number, field: keyof SubjectT, value: number) => {
      const updatedSubjects = [...selectedSubjects];
      updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };

      // Пересчитываем totalPrice для предмета
      updatedSubjects[index].totalPrice =
        updatedSubjects[index].pricePerLesson * (updatedSubjects[index].unpaidLessonsAmount || 0);

      setValue('subjects', updatedSubjects, { shouldValidate: true });
    },
    [selectedSubjects, setValue],
  );

  const handleClearForm = () => {
    setValue('studentId', '');
    setValue('subjects', []);
    setValue('invoicePrice', 0);
  };

  const onSubmit = (data: FormData) => {
    data.invoicePrice = totalInvoicePrice;
    console.log('invoice form data: ', data);
  };

  return {
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
  };
};
