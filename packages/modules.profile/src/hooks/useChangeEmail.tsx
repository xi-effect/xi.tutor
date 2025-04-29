/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from '@xipkg/form';
import { useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';
import { useUpdateEmail } from '../services/useUpdateEmail';
import { zodResolver } from '@hookform/resolvers/zod';

// Схема валидации для формы изменения почты
const schema = z.object({
  email: z
    .string({ required_error: 'Обязательное поле' })
    .email({ message: 'Некорректный формат данных' }),
  password: z.string({ required_error: 'Обязательное поле' }).min(6, {
    message: 'Минимальная длина пароля - 6 символов',
  }),
});

export type FormDataT = {
  email: string;
  password: string;
};

export interface IEmailModalStage {
  type: string;
  email: string;
}

export const useChangeEmail = () => {
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [timer, setTimer] = useState(false);
  const [stage, setStage] = useState<IEmailModalStage>({
    type: 'form',
    email: '',
  });

  const { updateEmail } = useUpdateEmail();

  const form = useForm<FormDataT>({
    resolver: zodResolver(schema),
  });

  const {
    control,
    handleSubmit,
    trigger,
    setError,
    formState: { errors },
  } = form;

  const changePasswordShow = () => {
    setIsPasswordShow((prev) => !prev);
  };

  const onSubmit = async (data: FormDataT) => {
    trigger();
    try {
      const response = await updateEmail.mutateAsync({
        new_email: data.email,
        password: data.password,
      });

      if (response.status === 200) {
        setStage({ type: 'success', email: data.email });
        toast('Вы успешно изменили почту!');
      }
    } catch (error: any) {
      // Обработка ошибок от API
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        if (errors.email) {
          setError('email', { message: errors.email });
        }

        if (errors.password) {
          setError('password', { message: errors.password });
        }
      } else {
        toast.error('Произошла ошибка при смене почты');
      }
    }
  };

  return {
    form,
    isPasswordShow,
    timer,
    stage,
    errors,
    control,
    handleSubmit,
    onSubmit,
    changePasswordShow,
    setTimer,
    setStage,
  };
};
