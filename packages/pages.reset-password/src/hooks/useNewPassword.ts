import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';

import { useFormSchemaPassword, FormDataPassword } from '../model/formSchemaPassword';
import { useResetPasswordConfirm } from 'common.services';

export function useNewPassword(resetToken: string) {
  const { t } = useTranslation('resetPassword');

  const navigate = useNavigate();

  const { resetPasswordConfirm } = useResetPasswordConfirm();

  const formSchemaPassword = useFormSchemaPassword();

  const form = useForm<FormDataPassword>({
    resolver: zodResolver(formSchemaPassword),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormDataPassword) => {
    try {
      await resetPasswordConfirm.mutateAsync({
        token: resetToken,
        new_password: data.password,
      });

      toast.success(t('resetPassword.passwordChanged'));

      navigate({ to: '/signin' });
    } catch (error: unknown) {
      console.error('Reset password error:', error);

      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          form.setError('password', {
            type: 'manual',
            message: t('resetPassword.tokenExpired'),
          });
          toast.error(t('resetPassword.tokenExpired'));
          return;
        }
      }

      if (error instanceof Error && error.message === 'Token expired') {
        form.setError('password', {
          type: 'manual',
          message: t('resetPassword.tokenExpired'),
        });
      } else if (error instanceof Error && error.message === 'Invalid password format') {
        form.setError('password', {
          type: 'manual',
          message: t('resetPassword.invalidPassword'),
        });
      } else {
        toast.error(t('resetPassword.error'));
      }
    }
  };

  return {
    form,
    onSubmit,
  };
}
