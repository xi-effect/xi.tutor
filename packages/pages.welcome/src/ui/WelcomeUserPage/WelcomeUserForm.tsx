import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@xipkg/form';
import { useTranslation } from 'react-i18next';
import { Input } from '@xipkg/input';
import { Button } from '@xipkg/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWelcomeUserFormSchema, type WelcomeUserFormData } from '../../model';
import { useWelcomeUserForm, useWelcomeContext } from '../../hooks';

export const WelcomeUserForm = () => {
  const { t } = useTranslation('welcomeUser');
  const formSchema = useWelcomeUserFormSchema();

  const { email, display_name } = useWelcomeContext();

  const form = useForm<WelcomeUserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: display_name || '',
    },
  });

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = form;

  const { onWelcomeUserForm, isLoading } = useWelcomeUserForm();

  const onSubmit = ({ displayName }: WelcomeUserFormData) => {
    onWelcomeUserForm(displayName);
  };

  const [displayName] = watch(['displayName']);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex h-full w-full flex-col">
        <FormField
          control={control}
          name="displayName"
          defaultValue=""
          render={({ field }) => (
            <FormItem className="mt-8">
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Input
                  className="mt-1"
                  error={!!errors?.displayName}
                  autoComplete="off"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormLabel className="mt-6">{t('email')}</FormLabel>
        <div className="bg-gray-10 mt-2 flex h-12 w-full flex-row items-start rounded-lg p-3 leading-[22px] text-gray-50">
          {email}
        </div>
        <div className="mt-auto flex flex-row gap-6 pt-4">
          <Button type="submit" className="w-full" disabled={!displayName?.length || isLoading}>
            {t('continue_button')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
