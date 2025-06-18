import { useTransition, useState } from 'react';
import { useForm } from '@xipkg/form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRequestPasswordReset } from 'common.services';

import { useFormSchemaEmail, FormDataEmail } from '../model/formSchemaEmail';
import { typeResponseRequest } from '../types';

export const usePasswordReset = () => {
  const { t } = useTranslation('resetPassword');

  const [isPending, startTransition] = useTransition();

  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const { requestPasswordReset } = useRequestPasswordReset();
  const formSchema = useFormSchemaEmail();

  const form = useForm<FormDataEmail>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const { setError, reset } = form;

  const onSubmit = async (data: FormDataEmail) => {
    try {
      const response = await requestPasswordReset(data.email);

      startTransition(() => {
        switch (response.status) {
          case typeResponseRequest.SuccessfulResponse:
            setSubmittedEmail(data.email);
            reset();
            toast.success(t('requestSent'));
            setIsSubmitSuccessful(true);
            break;

          case typeResponseRequest.ValidationError:
            setError('email', {
              type: 'manual',
              message: t('invalidEmail'),
            });
            setIsSubmitSuccessful(false);
            break;

          default:
            setError('email', {
              type: 'manual',
              message: t('error'),
            });
            setIsSubmitSuccessful(false);
            break;
        }
      });
    } catch (error) {
      startTransition(() => {
        if (
          error instanceof AxiosError &&
          error.response?.status === typeResponseRequest.UserNotFound
        ) {
          setError('email', {
            type: 'manual',
            message: t('emailNotFound'),
          });
        } else if (error instanceof Error && error.message === 'Email not found') {
          setError('email', {
            type: 'manual',
            message: t('emailNotFound'),
          });
        } else {
          console.error('Reset password error:', error);
          toast.error(t('error'));
        }
        setIsSubmitSuccessful(false);
      });
    }
  };

  return {
    form,
    onSubmit,
    isLoading: isPending,
    isSubmitSuccessful,
    submittedEmail,
  };
};
