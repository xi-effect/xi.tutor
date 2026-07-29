import {
  Form,
  FormControl,
  FormDescription,
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
import { useSyncAutofillOnSubmit } from 'common.utils';
import { useWelcomeUserFormSchema, type WelcomeUserFormData } from '../../model';
import { useWelcomeUserForm, useWelcomeContext } from '../../hooks';

export const WelcomeUserForm = () => {
  const { t } = useTranslation('welcomeUser');
  const formSchema = useWelcomeUserFormSchema();

  const { email } = useWelcomeContext();

  const form = useForm<WelcomeUserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
    },
  });

  const {
    control,
    watch,
    formState: { errors },
  } = form;

  const syncAutofillAndSubmit = useSyncAutofillOnSubmit(form);
  const { onWelcomeUserForm, isLoading } = useWelcomeUserForm();

  const onSubmit = ({ displayName }: WelcomeUserFormData) => {
    onWelcomeUserForm(displayName.trim());
  };

  const [displayName] = watch(['displayName']);

  return (
    <Form {...form}>
      <form onSubmit={syncAutofillAndSubmit(onSubmit)} className="flex w-full flex-1 flex-col">
        <FormField
          control={control}
          name="displayName"
          render={({ field }) => (
            <FormItem className="mt-8">
              <FormLabel className="dark:text-text-primary">{t('name')}</FormLabel>
              <FormControl>
                <Input
                  className="mt-1"
                  error={!!errors?.displayName}
                  autoComplete="name"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-text-secondary pt-0 text-xs">
                {t('name_hint')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormLabel className="dark:text-text-primary mt-6">{t('email')}</FormLabel>
        <div className="bg-background-subtle dark:text-text-primary text-text-muted mt-2 flex h-12 w-full flex-row items-start rounded-lg p-3 leading-[22px]">
          {email}
        </div>
        <div className="mt-auto flex flex-row gap-6 pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={!displayName?.trim().length || isLoading}
          >
            {t('continue_button')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
