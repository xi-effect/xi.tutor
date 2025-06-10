import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

import { mockPasswordService } from '../mockPasswordService';
import { useFormSchemaPassword, FormDataPassword } from '../model/formSchemaPassword';

export function useNewPassword(resetToken: string) {
  const { t } = useTranslation('resetPassword');

  const navigate = useNavigate();

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
      await mockPasswordService.resetPassword({
        token: resetToken,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      toast.success(t('resetPassword.passwordChanged'));

      navigate({ to: '/signin' });
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(t('resetPassword.error'));
      throw error;
    }
  };

  return {
    form,
    onSubmit,
  };
}
