import { useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@xipkg/link';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@xipkg/form';
import { Eyeoff, Eyeon } from '@xipkg/icons';

import { useFormSchema, type FormData } from '../model';
import { useSignupForm } from '../hooks';


export const SignUpPage = () => {
  const { t } = useTranslation('signup');
  const searchParams = useSearch({ strict: false });

  const formSchema = useFormSchema();
  const { onSignupForm, isPending } = useSignupForm();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    // setError,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = (data: FormData) => {
    onSignupForm(data);  
  };

  const [isPasswordShow, setIsPasswordShow] = useState(false);

  const changePasswordShow = () => {
    setIsPasswordShow((prev) => !prev);
  };

  const getSigninHref = () => {
    if (searchParams.iid && searchParams.community) {
      return `/signin?iid=${searchParams.iid}&community=${searchParams.community}`;
    }

    return '/signin';
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-full w-full flex-col justify-items-start space-y-4"
      >
        <div className="self-center">
          {/* <Logo height={22} width={180} logoVariant="navigation" logoSize="default" /> */}
          Logo
        </div>
        <h1 className="self-center text-2xl font-semibold">{t('register')}</h1>
        <FormField
          control={control}
          name="username"
          defaultValue=""
          render={({ field }) => (
            <FormItem className="pt-4">
              <FormLabel htmlFor="user name">{t('username')}</FormLabel>
              <FormControl>
                <Input
                  error={!!errors?.username}
                  autoComplete="off"
                  type="text"
                  id="user name"
                  {...field}
                />
              </FormControl> 
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="user email">{t('email')}</FormLabel>
              <FormControl>
                <Input
                  error={!!errors?.email}
                  autoComplete="on"
                  type="email"
                  id="user email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="password"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="user password">{t('password')}</FormLabel>
              <FormControl>
                <Input
                  error={!!errors?.password}
                  autoComplete="on"
                  id="user password"
                  type={isPasswordShow ? 'text' : 'password'}
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
        <div className="flex h-full w-full items-end justify-between">
          <div className="flex h-[48px] items-center">
            <Link size="l" theme="brand" variant="hover" href={getSigninHref()}>
              {t('sign_in')}
            </Link>
          </div>
          {!isPending ? (
            <Button size="m" variant="default" type="submit" className="w-[214px]">
              {t('sign_up')}
            </Button>
          ) : (
            <Button variant="default-spinner" className="w-[214px]" disabled />
          )}
        </div>
      </form>
    </Form>
  );
};
