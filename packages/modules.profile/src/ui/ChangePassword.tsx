import { Close } from '@xipkg/icons';
import * as M from '@xipkg/modal';
import React from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { Button } from '@xipkg/button';
import { Eyeoff, Eyeon } from '@xipkg/icons';
import { modalTitleClass } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { useChangePassword } from '../hooks';

type ChangePasswordModalT = {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactElement<HTMLButtonElement>;
};

export const ChangePassword = ({ open, onOpenChange, children }: ChangePasswordModalT) => {
  const { t } = useTranslation('profile');
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
              className="bg-background-page top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full px-0 pt-0 sm:right-4"
            >
              <Close className="fill-icon-primary h-5 w-5" />
            </M.ModalCloseButton>
            <M.ModalHeader>
              <M.ModalTitle className={modalTitleClass}>{t('changePassword.title')}</M.ModalTitle>
            </M.ModalHeader>
            <Form {...form}>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-3 px-5 pt-5 pb-3">
                  <FormField
                    control={control}
                    name="currentPassword"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel>{t('changePassword.currentPassword')}</FormLabel>
                        <FormControl className="mt-2">
                          <Input
                            {...field}
                            error={!!error}
                            autoComplete="off"
                            type={isPasswordShow.currentPassword ? 'text' : 'password'}
                            afterClassName="cursor-pointer"
                            after={
                              isPasswordShow.currentPassword ? (
                                <Eyeoff className="fill-icon-secondary" />
                              ) : (
                                <Eyeon className="fill-icon-secondary" />
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
                        <FormLabel>{t('changePassword.newPassword')}</FormLabel>
                        <FormControl className="mt-2">
                          <Input
                            {...field}
                            error={!!error}
                            autoComplete="off"
                            type={isPasswordShow.newPassword ? 'text' : 'password'}
                            afterClassName="cursor-pointer"
                            after={
                              isPasswordShow.newPassword ? (
                                <Eyeoff className="fill-icon-secondary" />
                              ) : (
                                <Eyeon className="fill-icon-secondary" />
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
                        <FormLabel>{t('changePassword.confirmPassword')}</FormLabel>
                        <FormControl className="mt-2">
                          <Input
                            {...field}
                            error={!!error}
                            autoComplete="off"
                            type={isPasswordShow.confirmPassword ? 'text' : 'password'}
                            afterClassName="cursor-pointer"
                            after={
                              isPasswordShow.confirmPassword ? (
                                <Eyeoff className="fill-icon-secondary" />
                              ) : (
                                <Eyeon className="fill-icon-secondary" />
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
                <div className="border-border-default flex justify-start gap-4 border-t p-6 px-5 py-5">
                  <Button type="submit" disabled={isLoading}>
                    {t('changePassword.change')}
                  </Button>
                  <Button onClick={() => onOpenChange(false)} variant="ghost">
                    {t('changePassword.cancel')}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )) ||
          (stage === 'success' && (
            <div className="border-border-default space-y-8 border-t p-8">
              <p className="text-text-primary text-center text-2xl font-semibold">
                {t('changePassword.success')}
              </p>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  setStage('form');
                }}
                className="mt-4 w-full"
              >
                {t('changePassword.continue')}
              </Button>
            </div>
          ))}
      </M.ModalContent>
    </M.Modal>
  );
};
