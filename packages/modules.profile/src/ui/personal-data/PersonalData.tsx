import { Button } from '@xipkg/button';
// import { patch } from 'pkg.utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@xipkg/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@xipkg/input';
import { UserPreview } from './UserPreview';
import { useCurrentUser, useUpdateProfile } from 'common.services';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const PersonalData = () => {
  const { t } = useTranslation('profile');
  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  const FormSchema = useMemo(
    () =>
      z.object({
        displayName: z
          .string({ error: t('validation.required') })
          .trim()
          .min(1, { message: t('validation.required') })
          .min(2, { message: t('validation.minLength', { count: 2 }) })
          .max(30, { message: t('validation.maxLength', { count: 30 }) }),
      }),
    [t],
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      displayName: user?.display_name || '',
    },
  });

  const {
    control,
    trigger,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    trigger();

    try {
      await updateProfile.mutateAsync({
        display_name: formData.displayName.trim(),
      });
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
    }
  };

  return (
    <>
      <UserPreview />
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="border-border-strong flex w-full flex-col rounded-2xl border p-6"
        >
          <div className="flex w-full flex-col gap-8">
            <div className="w-full md:max-w-[calc(50%-1rem)]">
              <FormField
                control={control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('personalData.displayName')}</FormLabel>
                    <FormControl className="mt-2">
                      <Input
                        error={!!errors?.displayName}
                        type="text"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="mt-8">
            <Button type="submit" size="m">
              {t('personalData.save')}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
