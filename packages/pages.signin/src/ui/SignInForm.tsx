// features/auth/ui/SignInForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import { Eyeoff, Eyeon } from '@xipkg/icons';
import { Link } from '@xipkg/link';
import { FormSchema, FormData } from '../model/formSchema';
import { InvitationMessage } from './InvitationMessage';
import { useSignIn } from '../hooks';

export const SignInForm: React.FC = () => {
  // Получаем параметры из URL через стандартный API
  const query = new URLSearchParams(window.location.search);
  const communityName = query.get('community');

  const { onSignIn, isPending, error } = useSignIn();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const changePasswordShow = () => setIsPasswordShow((prev) => !prev);

  const getSignupHref = () => {
    if (query.has('iid') && query.get('community')) {
      return `/signup?iid=${query.get('iid')}&community=${query.get('community')}`;
    }
    return '/signup';
  };

  // Функция редиректа, использующая стандартное изменение window.location
  const redirect = (url: string) => {
    window.location.href = url;
  };

  const onSubmit = (data: FormData) => {
    onSignIn(data, redirect);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex h-full w-full flex-col space-y-4">
        <div className="self-center">
          {/* Здесь можно разместить логотип */}
          Logo
        </div>
        <h1 className="self-center text-2xl font-semibold">Вход в аккаунт</h1>
        {communityName && <InvitationMessage communityName={communityName} />}
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem className="pt-4">
              <FormLabel>Электронная почта</FormLabel>
              <FormControl>
                <Input error={!!errors?.email} autoComplete="on" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input
                  error={!!errors?.password}
                  autoComplete="on"
                  type={isPasswordShow ? 'text' : 'password'}
                  afterClassName="cursor-pointer"
                  after={
                    isPasswordShow ? (
                      <Eyeoff className="fill-gray-60" />
                    ) : (
                      <Eyeon className="fill-gray-60" />
                    )
                  }
                  afterProps={{
                    onClick: changePasswordShow,
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Link size="l" variant="always" href="/reset-password">
          Восстановить пароль
        </Link>
        <div className="flex h-full w-full items-end justify-between">
          <div className="flex h-[48px] items-center">
            <Link
              id="to-signup-link"
              data-umami-event="to-signup-link"
              size="l"
              theme="brand"
              variant="hover"
              href={getSignupHref()}
            >
              Зарегистрироваться
            </Link>
          </div>
          {!isPending ? (
            <Button variant="default" type="submit" className="w-24">
              Войти
            </Button>
          ) : (
            <Button variant="default-spinner" className="w-24" disabled />
          )}
        </div>
        {error && <div className="text-red-500">{error}</div>}
      </form>
    </Form>
  );
};
