import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '@xipkg/badge';
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
import { UserProfile } from '@xipkg/userprofile';
import { cn } from '@xipkg/utils';
import { useEffect } from 'react';
import type { z } from 'zod';
import { changeLessonFormSchema, type ChangeLessonFormData } from '../model';

export type ChangeLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  participantName: string;
  participantId?: number;
  defaultTitle: string;
  defaultDescription?: string;
  onSave: (data: ChangeLessonFormData) => void;
};

export const ChangeLessonModal = ({
  open,
  onOpenChange,
  subject,
  participantName,
  participantId,
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
              <div className="flex items-center gap-3">
                <UserProfile size="s" userId={participantId ?? 0} text={participantName} />
                <Badge
                  size="m"
                  className="text-gray-60 bg-gray-10 text-s-base ml-auto shrink-0 rounded-lg border-none px-2 py-1 font-medium"
                >
                  <span className="max-w-[180px] truncate">{subject}</span>
                </Badge>
              </div>

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
