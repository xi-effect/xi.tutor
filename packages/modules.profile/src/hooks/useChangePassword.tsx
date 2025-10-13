/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@xipkg/form';
import * as z from 'zod';
import { toast } from 'sonner';
import { useUpdatePassword } from '../services/useUpdatePassword';

const schema = z
  .object({
    currentPassword: z.string({ required_error: 'Обязательное поле' }),
    newPassword: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
    confirmPassword: z.string().min(1, { message: 'Обязательное поле' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof schema>;

export const useChangePassword = () => {
  const [stage, setStage] = useState<'form' | 'success'>('form');
  const [isPasswordShow, setIsPasswordShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const { updatePassword } = useUpdatePassword();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const changePasswordShow = (fieldId: keyof typeof isPasswordShow) => {
    setIsPasswordShow((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const onSubmit = async (data: ChangePasswordFormValues) => {
    const { currentPassword, newPassword } = data;

    try {
      await updatePassword.mutateAsync({
        password: currentPassword,
        new_password: newPassword,
      });

      toast('Пароль успешно изменен');
      setStage('success');
    } catch (error: any) {
      if (error?.response?.data?.detail === 'Wrong password') {
        form.setError('currentPassword', {
          type: 'manual',
          message: 'Неверный пароль',
        });
      } else {
        toast('Произошла ошибка');
      }
    }
  };

  return {
    form,
    stage,
    setStage,
    isPasswordShow,
    changePasswordShow,
    onSubmit,
    isLoading: updatePassword.isPending,
  };
};
