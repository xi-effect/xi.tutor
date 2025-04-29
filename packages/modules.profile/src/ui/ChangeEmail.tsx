import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import * as M from '@xipkg/modal';
import React, { useEffect, useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import { Clock } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { Eyeoff, Eyeon } from '@xipkg/icons';
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
    <div className="bg-red-0 flex items-center gap-4 rounded-lg p-4 text-red-100">
      <Clock className="fill-red-100" />
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
      <M.ModalContent>
        {(stage.type === 'form' && (
          <>
            <M.ModalCloseButton>
              <Close className="fill-gray-80 sm:fill-gray-0" />
            </M.ModalCloseButton>
            <M.ModalHeader>
              <M.ModalTitle>Изменение электронной почты</M.ModalTitle>
            </M.ModalHeader>
            <Form {...form}>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-3 px-5 pt-5 pb-3">
                  {timer && (
                    <Timer
                      durationSecs={10 * 60}
                      getTitle={(t) => `Отправить повторно можно через ${t}`}
                      onTimerEnd={() => setTimer(false)}
                    />
                  )}
                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Новый адрес электронной почты</FormLabel>
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
                        <FormLabel>Пароль</FormLabel>
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
                    Изменить
                  </Button>
                  <Button onClick={() => onOpenChange(false)} type="button" variant="secondary">
                    Отменить
                  </Button>
                </M.ModalFooter>
              </form>
            </Form>
          </>
        )) ||
          (stage.type === 'success' && (
            <div className="space-y-8 p-8">
              <M.ModalTitle className="hidden">Изменение электронной почты</M.ModalTitle>
              <p className="text-center text-2xl font-semibold text-gray-100">
                На адрес {stage.email} отправлено письмо с подтверждением
              </p>
              <Button onClick={() => setStage({ type: 'form', email: '' })} className="mt-4 w-full">
                Продолжить
              </Button>
            </div>
          ))}
      </M.ModalContent>
    </M.Modal>
  );
};
