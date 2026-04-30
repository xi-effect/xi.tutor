import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@xipkg/button';
import { Form, FormControl, FormField, FormItem, FormMessage, useForm } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { Textarea } from '@xipkg/textarea';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { UserProfile } from '@xipkg/userprofile';
import { cn } from '@xipkg/utils';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { z } from 'zod';
import { changeLessonFormSchema, type ChangeLessonFormData } from '../model';

/** Как строка кабинета в {@link LessonCard} ScheduleKanban: аватар + подпись с truncate и Tooltip при обрезке. */
function ChangeLessonModalClassroomLine({
  classroomName,
  userId,
}: {
  classroomName: string;
  userId: number;
}) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) return;

    const update = () => {
      setIsTruncated(el.scrollWidth > el.clientWidth + 1);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [classroomName]);

  return (
    <div className="flex w-full min-w-0 items-center gap-1.5">
      <UserProfile
        className="min-w-0 shrink-0"
        size="s"
        userId={userId}
        text={classroomName}
        withOutText
      />
      <Tooltip {...(!isTruncated ? { open: false } : {})}>
        <TooltipTrigger asChild>
          <span
            ref={labelRef}
            className="text-xs-base-size min-w-0 flex-1 truncate text-left leading-normal text-gray-100"
          >
            {classroomName}
          </span>
        </TooltipTrigger>
        <TooltipContent align="start" side="top" className="max-w-sm font-normal wrap-break-word">
          {classroomName}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export type ChangeLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Как у LessonCard: скрыть строки предмета и кабинета (расписание внутри одного кабинета). */
  hideClassroomAndSubject?: boolean;
  /** Название предмета из API кабинета — строка `text-gray-40 text-xs`, как на LessonCard */
  subjectName?: string | null;
  /** Подпись строки кабинета / участника */
  classroomName: string;
  /** userId для аватара строки кабинета: как `avatarUserId ?? teacherId` на LessonCard */
  classroomLineUserId?: number;
  teacherId?: number;
  defaultTitle: string;
  defaultDescription?: string;
  onSave: (data: ChangeLessonFormData) => void;
};

export const ChangeLessonModal = ({
  open,
  onOpenChange,
  hideClassroomAndSubject = false,
  subjectName,
  classroomName,
  classroomLineUserId,
  teacherId,
  defaultTitle,
  defaultDescription = '',
  onSave,
}: ChangeLessonModalProps) => {
  const initialValues: ChangeLessonFormData = {
    title: defaultTitle,
    description: defaultDescription,
  };

  const form = useForm<z.input<typeof changeLessonFormSchema>>({
    resolver: zodResolver(changeLessonFormSchema),
    defaultValues: initialValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    if (open) {
      reset({
        title: defaultTitle,
        description: defaultDescription,
      });
    }
  }, [open, defaultTitle, defaultDescription, reset]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset(initialValues);
      onOpenChange(false);
    }
  };

  const onSubmit = (data: ChangeLessonFormData) => {
    onSave(data);
    handleClose();
  };

  const lineUserId = classroomLineUserId ?? teacherId ?? 0;

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="relative w-full max-w-[480px]" aria-describedby={undefined}>
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle className="text-xl-base max-w-[calc(100%-56px)] font-semibold text-gray-100">
            Изменить занятие
          </ModalTitle>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="flex flex-col gap-4 px-6 pt-0 pb-4">
              {!hideClassroomAndSubject ? (
                <div className="flex min-w-0 flex-col gap-2">
                  {subjectName != null ? (
                    <span className="text-gray-40 text-xs">{subjectName}</span>
                  ) : null}

                  <ChangeLessonModalClassroomLine
                    classroomName={classroomName}
                    userId={lineUserId}
                  />
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-gray-100">О занятии</span>

                <FormField
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormControl>
                        <Input
                          {...field}
                          error={!!errors.title}
                          autoComplete="off"
                          type="text"
                          id="change-lesson-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormControl>
                        <Textarea
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          id="change-lesson-description"
                          placeholder="Добавить описание"
                          maxRows={6}
                          hideCounter
                          aria-invalid={!!errors.description}
                          className={cn(
                            'border-gray-10 placeholder:text-gray-40 min-h-[88px] resize-y rounded-lg border px-3 py-2 text-sm text-gray-100',
                            errors.description && 'border-red-60',
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ModalBody>

            <ModalFooter className="flex flex-row gap-2 px-6 pb-6">
              <Button
                type="button"
                variant="none"
                size="m"
                className="bg-gray-5 text-gray-70 hover:bg-gray-10 hover:text-gray-80 h-11 flex-1 p-0 font-medium"
                onClick={handleClose}
              >
                Отменить
              </Button>
              <Button type="submit" variant="primary" size="m" className="h-11 flex-1 p-0">
                Сохранить
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
