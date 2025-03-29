import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
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

import { FormSchema, type FormData } from '../model';


export const SignUpPage = () => {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false });

  // const onSignUp = useMainSt((state) => state.onSignUp);
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const {
    control,
    // setError,
    handleSubmit,
    trigger,
    formState: { errors },
  } = form;

  const [isButtonActive, setIsButtonActive] = useState(true);

  // data: z.infer<typeof FormSchema>
  const onSubmit = async () => {
    trigger();
    setIsButtonActive(false);
    // const status = await onSignUp({ ...data, setError });

    const status = 200;
    if (status === 200 && searchParams.iid && searchParams.community) {
      navigate({
        to: "/welcome/user-info",
        search: { iid: searchParams.iid, community: searchParams.community },
      });
    } else if (status === 200) {
      navigate({
        to: "/welcome/user-info",
      });
    } else {
      setIsButtonActive(true);
    }
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
    <div className="xs:h-screen flex h-[100dvh] w-screen flex-col flex-wrap content-center justify-center p-1">
      <div className="xs:border xs:border-gray-10 xs:rounded-2xl flex h-[600px] w-full max-w-[420px] p-8">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex h-full w-full flex-col justify-items-start space-y-4"
          >
            <div className="self-center">
              {/* <Logo height={22} width={180} logoVariant="navigation" logoSize="default" /> */}
              Logo
            </div>
            <h1 className="self-center text-2xl font-semibold">Регистрация</h1>
            <FormField
              control={control}
              name="username"
              defaultValue=""
              render={({ field }) => (
                <FormItem className="pt-4">
                  <FormLabel htmlFor="user name">Имя пользователя</FormLabel>
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
                  <FormLabel htmlFor="user email">Электронная почта</FormLabel>
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
                  <FormLabel htmlFor="user password">Пароль</FormLabel>
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
                  Войти
                </Link>
              </div>
              {isButtonActive ? (
                <Button size="m" variant="default" type="submit" className="w-[214px]">
                  Зарегистрироваться
                </Button>
              ) : (
                <Button variant="default-spinner" className="w-[214px]" disabled />
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
