import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from '@xipkg/form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRequestPasswordReset } from 'common.services';

import { useFormSchemaEmail, FormDataEmail } from '../model/formSchemaEmail';
import { typeResponseRequest } from '../types';
import { isPasswordResetUserNotFound } from './passwordResetLogic';

export const usePasswordReset = () => {
  const { t } = useTranslation('resetPassword');
  const [isSending, setIsSending] = useState(false);
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

  const { setError } = form;

  const sendResetLink = async (email: string, options?: { resend?: boolean }) => {
    if (isSending) {
      return;
    }

    const isResend = Boolean(options?.resend);
    setIsSending(true);

    try {
      const response = await requestPasswordReset(email);

      switch (response.status) {
        case typeResponseRequest.SuccessfulResponse:
          setSubmittedEmail(email);
          setIsSubmitSuccessful(true);
          toast.success(t('requestSent'));
          break;

        case typeResponseRequest.ValidationError:
          if (isResend) {
            toast.error(t('invalidEmail'));
          } else {
            setError('email', {
              type: 'manual',
              message: t('invalidEmail'),
            });
          }
          setIsSubmitSuccessful(false);
          break;

        default:
          if (isResend) {
            toast.error(t('error'));
          } else {
            setError('email', {
              type: 'manual',
              message: t('error'),
            });
          }
          setIsSubmitSuccessful(false);
          break;
      }
    } catch (error) {
      if (isPasswordResetUserNotFound(error)) {
        if (isResend) {
          toast.error(t('emailNotFound'));
        } else {
          setError('email', {
            type: 'manual',
            message: t('emailNotFound'),
          });
        }
      } else {
        console.error('Reset password error:', error);
        toast.error(t('error'));
      }
      if (!isResend) {
        setIsSubmitSuccessful(false);
      }
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = async (data: FormDataEmail) => {
    await sendResetLink(data.email);
  };

  const onResend = async () => {
    if (!submittedEmail) {
      return;
    }
    await sendResetLink(submittedEmail, { resend: true });
  };

  return {
    form,
    onSubmit,
    onResend,
    isLoading: isSending,
    isSubmitSuccessful,
    submittedEmail,
  };
};
