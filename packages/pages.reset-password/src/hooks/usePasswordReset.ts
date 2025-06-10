import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@xipkg/form';

import { mockPasswordService } from '../mockPasswordService';
import { useFormSchemaEmail, FormDataEmail } from '../model/formSchemaEmail';

export const usePasswordReset = () => {
  const { t } = useTranslation('resetPassword');

  const [isLoading, setIsLoading] = useState(false);

  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const [isErrorEmail, setIsErrorEmail] = useState<string | null>(null);

  const formSchema = useFormSchemaEmail();

  const form = useForm<FormDataEmail>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormDataEmail) => {
    try {
      setIsLoading(true);
      const response = await mockPasswordService.requestPasswordReset(data);
      console.log(response);

      setSubmittedEmail(data.email);

      form.reset();

      setIsErrorEmail(null);

      toast.success(t('requestSent'));

      setIsSubmitSuccessful(true);
    } catch (error) {
      setIsSubmitSuccessful(false);

      console.error('Reset password error:', error);

      if (error instanceof Error) {
        if (error.message === 'Email not found') {
          setIsErrorEmail(t('emailNotFound'));
        } else if (error.message === 'Invalid email format') {
          setIsErrorEmail(t('invalidEmail'));
        } else {
          toast.error(t('error'));
        }
      } else {
        toast.error(t('error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
    isSubmitSuccessful,
    isErrorEmail,
    setIsErrorEmail,
    submittedEmail,
  };
};
