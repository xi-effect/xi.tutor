import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import * as M from '@xipkg/modal';
import React, { useEffect, useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import { Clock } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { Eyeoff, Eyeon } from '@xipkg/icons';
import { modalTitleClass } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { useChangeEmail } from '../hooks';

interface TimerProps {
  durationSecs: number;
  getTitle: (currentDuration: string) => string;
  onTimerEnd: () => void;
}

function formatTime(seconds: number) {
  // Вычисляем минуты и секунды из общего количества секунд
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Добавляем ведущий ноль, если минуты или секунды меньше 10
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

  // Возвращаем отформатированное время
  return `${formattedMinutes}:${formattedSeconds}`;
}

const Timer = ({ getTitle, onTimerEnd, durationSecs }: TimerProps) => {
  const [leftSecs, setSecs] = useState(durationSecs);

  useEffect(() => {
    const t = setInterval(() => {
      if (leftSecs > 0) {
        setSecs((p) => p - 1);
      } else {
        clearInterval(t);
        onTimerEnd();
      }
    }, 1000);
    return () => clearInterval(t);
  });

  return (
    <div className="bg-status-error-background text-text-danger flex items-center gap-4 rounded-lg p-4">
      <Clock className="fill-icon-danger" />
      <p className="font-semibold">{getTitle(formatTime(leftSecs))}</p>
    </div>
  );
};

type ChangeEmailModalT = {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactElement<HTMLButtonElement>;
};

export const ChangeEmail = ({ open, onOpenChange, children }: ChangeEmailModalT) => {
  const { t } = useTranslation('profile');
  const {
    form,
    isPasswordShow,
    timer,
    stage,
    control,
    errors,
    handleSubmit,
    onSubmit,
    changePasswordShow,
    setTimer,
    setStage,
  } = useChangeEmail();

  return (
    <M.Modal open={open} onOpenChange={(value) => onOpenChange(value)}>
      <M.ModalTrigger asChild>{children}</M.ModalTrigger>
      <M.ModalContent aria-describedby={undefined}>
        {(stage.type === 'form' && (
          <>
            <M.ModalCloseButton
              variant="full"
              className="bg-background-page top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full px-0 pt-0 sm:right-4"
            >
              <Close className="fill-icon-primary h-5 w-5" />
            </M.ModalCloseButton>
            <M.ModalHeader>
              <M.ModalTitle className={modalTitleClass}>{t('changeEmail.title')}</M.ModalTitle>
            </M.ModalHeader>
            <Form {...form}>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-3 px-5 pt-5 pb-3">
                  {timer && (
                    <Timer
                      durationSecs={10 * 60}
                      getTitle={(time) => t('changeEmail.resendTimer', { time })}
                      onTimerEnd={() => setTimer(false)}
                    />
                  )}
                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('changeEmail.newEmail')}</FormLabel>
                        <FormControl className="mt-2">
                          <Input {...field} error={!!errors.email} autoComplete="on" />
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
                        <FormLabel>{t('changeEmail.password')}</FormLabel>
                        <FormControl className="mt-2">
                          <Input
                            {...field}
                            error={!!errors?.password}
                            autoComplete="off"
                            afterClassName="cursor-pointer"
                            type={isPasswordShow ? 'text' : 'password'}
                            after={isPasswordShow ? <Eyeoff /> : <Eyeon />}
                            afterProps={{
                              onClick: changePasswordShow,
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <M.ModalFooter className="flex justify-start gap-4 px-5 py-5">
                  <Button disabled={timer} className="disabled:cursor-not-allowed" type="submit">
                    {t('changeEmail.change')}
                  </Button>
                  <Button onClick={() => onOpenChange(false)} type="button" variant="ghost">
                    {t('changeEmail.cancel')}
                  </Button>
                </M.ModalFooter>
              </form>
            </Form>
          </>
        )) ||
          (stage.type === 'success' && (
            <div className="space-y-8 p-8">
              <M.ModalTitle className="hidden">{t('changeEmail.title')}</M.ModalTitle>
              <p className="text-text-primary text-center text-2xl font-semibold">
                {t('changeEmail.successMessage', { email: stage.email })}
              </p>
              <Button onClick={() => setStage({ type: 'form', email: '' })} className="mt-4 w-full">
                {t('changeEmail.continue')}
              </Button>
            </div>
          ))}
      </M.ModalContent>
    </M.Modal>
  );
};
