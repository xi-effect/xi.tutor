/* eslint-disable @typescript-eslint/ban-ts-comment */
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
import { toast } from 'sonner';
import { UserPreview } from './UserPreview';
import { useCurrentUser, useUpdateProfile } from 'common.services';

const FormSchema = z.object({
  username: z.string({ required_error: 'Обязательное поле' }),
  displayName: z.string({ required_error: 'Обязательное поле' }),
});

export const PersonalData = () => {
  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  const isMobile = useMediaQuery('(max-width: 719px)');
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      displayName: user?.display_name,
      username: user?.username,
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
    console.log(formData);

    try {
      const response = await updateProfile.mutateAsync({
        username: formData.username,
        display_name: formData.displayName,
      });

      if (response.status === 200) {
        toast('Данные успешно обновлены');
      } else {
        toast('Произошла ошибка');
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      toast('Произошла ошибка при обновлении данных');
    }
  };

  return (
    <>
      {!isMobile && <span className="text-3xl font-semibold">Личные данные</span>}
      <UserPreview className="mt-4" />
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="border-gray-80 mt-8 flex w-full flex-col rounded-2xl border p-6"
        >
          <div className="flex w-full flex-col gap-8 md:flex-row">
            <div className="w-full">
              <FormField
                control={control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Отображаемое имя</FormLabel>
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
                    <FormLabel>Имя пользователя</FormLabel>
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
            <Button type="submit" size="l">
              Сохранить
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
