import { Button } from '@xipkg/button';
// import { patch } from 'pkg.utils';
import { useMediaQuery } from '@xipkg/utils';
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
        username: z.string({ error: t('validation.required') }),
        displayName: z.string({ error: t('validation.required') }),
      }),
    [t],
  );

  const isMobile = useMediaQuery('(max-width: 719px)');
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      displayName: user?.display_name || '',
      username: user?.username || '',
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
        username: formData.username,
        display_name: formData.displayName,
      });
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
    }
  };

  return (
    <>
      {!isMobile && (
        <span className="dark:text-text-primary text-3xl font-semibold">
          {t('personalData.title')}
        </span>
      )}
      <UserPreview className="mt-4" />
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="border-border-strong mt-8 flex w-full flex-col rounded-2xl border p-6"
        >
          <div className="flex w-full flex-col gap-8 md:flex-row">
            <div className="w-full">
              <FormField
                control={control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('personalData.displayName')}</FormLabel>
                    <FormControl className="mt-2">
                      <Input error={!!errors?.displayName} type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full">
              <FormField
                control={control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('personalData.username')}</FormLabel>
                    <FormControl className="mt-2">
                      <Input error={!!errors?.username} type="text" {...field} />
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
