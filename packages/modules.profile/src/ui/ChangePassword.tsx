import { Close } from '@xipkg/icons';
import * as M from '@xipkg/modal';
import React from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { Button } from '@xipkg/button';
import { Eyeoff, Eyeon } from '@xipkg/icons';
import { modalTitleClass } from 'common.ui';
import { useChangePassword } from '../hooks';

type ChangePasswordModalT = {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactElement<HTMLButtonElement>;
};

export const ChangePassword = ({ open, onOpenChange, children }: ChangePasswordModalT) => {
  const { form, stage, setStage, isPasswordShow, changePasswordShow, onSubmit, isLoading } =
    useChangePassword();

  const { control, handleSubmit } = form;

  return (
    <M.Modal open={open} onOpenChange={(value) => onOpenChange(value)}>
      <M.ModalTrigger asChild>{children}</M.ModalTrigger>
      <M.ModalContent aria-describedby={undefined}>
        {(stage === 'form' && (
          <>
            <M.ModalCloseButton
              variant="full"
              className="bg-gray-5 top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full px-0 pt-0 sm:right-4"
            >
              <Close className="fill-gray-80 h-5 w-5" />
            </M.ModalCloseButton>
            <M.ModalHeader>
              <M.ModalTitle className={modalTitleClass}>Изменение пароля</M.ModalTitle>
            </M.ModalHeader>
            <Form {...form}>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-3 px-5 pt-5 pb-3">
                  <FormField
                    control={control}
                    name="currentPassword"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel>Текущий пароль</FormLabel>
                        <FormControl className="mt-2">
                          <Input
                            {...field}
                            error={!!error}
                            autoComplete="off"
                            type={isPasswordShow.currentPassword ? 'text' : 'password'}
                            afterClassName="cursor-pointer"
                            after={
                              isPasswordShow.currentPassword ? (
                                <Eyeoff className="fill-gray-60" />
                              ) : (
                                <Eyeon className="fill-gray-60" />
                              )
                            }
                            afterProps={{
                              onClick: () => changePasswordShow('currentPassword'),
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="newPassword"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel>Новый пароль</FormLabel>
                        <FormControl className="mt-2">
                          <Input
                            {...field}
                            error={!!error}
                            autoComplete="off"
                            type={isPasswordShow.newPassword ? 'text' : 'password'}
                            afterClassName="cursor-pointer"
                            after={
                              isPasswordShow.newPassword ? (
                                <Eyeoff className="fill-gray-60" />
                              ) : (
                                <Eyeon className="fill-gray-60" />
                              )
                            }
                            afterProps={{
                              onClick: () => changePasswordShow('newPassword'),
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="confirmPassword"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel>Подтвердите пароль</FormLabel>
                        <FormControl className="mt-2">
                          <Input
                            {...field}
                            error={!!error}
                            autoComplete="off"
                            type={isPasswordShow.confirmPassword ? 'text' : 'password'}
                            afterClassName="cursor-pointer"
                            after={
                              isPasswordShow.confirmPassword ? (
                                <Eyeoff className="fill-gray-60" />
                              ) : (
                                <Eyeon className="fill-gray-60" />
                              )
                            }
                            afterProps={{
                              onClick: () => changePasswordShow('confirmPassword'),
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="border-gray-20 flex justify-start gap-4 border-t p-6 px-5 py-5">
                  <Button type="submit" disabled={isLoading}>
                    Изменить
                  </Button>
                  <Button onClick={() => onOpenChange(false)} variant="ghost">
                    Отменить
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )) ||
          (stage === 'success' && (
            <div className="border-gray-20 space-y-8 border-t p-8">
              <p className="text-center text-2xl font-semibold text-gray-100">Пароль изменён</p>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  setStage('form');
                }}
                className="mt-4 w-full"
              >
                Продолжить
              </Button>
            </div>
          ))}
      </M.ModalContent>
    </M.Modal>
  );
};
