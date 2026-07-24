/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@xipkg/form';
import * as z from 'zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useUpdatePassword } from '../services/useUpdatePassword';

export type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const useChangePassword = () => {
  const { t } = useTranslation('profile');
  const [stage, setStage] = useState<'form' | 'success'>('form');
  const [isPasswordShow, setIsPasswordShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const { updatePassword } = useUpdatePassword();

  const schema = useMemo(
    () =>
      z
        .object({
          currentPassword: z.string({ error: t('validation.required') }),
          newPassword: z.string().min(6, { message: t('validation.minLength', { count: 6 }) }),
          confirmPassword: z.string().min(1, { message: t('validation.required') }),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: t('validation.passwordsMismatch'),
          path: ['confirmPassword'],
        }),
    [t],
  );

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

      toast(t('changePassword.toastSuccess'));
      setStage('success');
    } catch (error: any) {
      if (error?.response?.data?.detail === 'Wrong password') {
        form.setError('currentPassword', {
          type: 'manual',
          message: t('changePassword.wrongPassword'),
        });
      } else {
        toast(t('changePassword.error'));
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
