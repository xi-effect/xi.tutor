import { useMemo, useState } from 'react';
import { useForm } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { Form, FormControl, FormField, FormItem } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { useMaterialUpdate } from '../hooks';

type TitleFormDataT = {
  name: string;
};

type EditableTitlePropsT = {
  title: string;
  materialId: string;
  className?: string;
  isTutor?: boolean;
};

export const EditableTitle = ({
  title,
  materialId,
  className,
  isTutor = false,
}: EditableTitlePropsT) => {
  const { t } = useTranslation('notes');
  const [isEditing, setIsEditing] = useState(false);
  const { update, isPending } = useMaterialUpdate();

  const titleSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('validation.required')).max(100, t('validation.max')),
      }),
    [t],
  );

  const form = useForm<TitleFormDataT>({
    resolver: zodResolver(titleSchema),
    defaultValues: {
      name: title,
    },
  });

  const { control, handleSubmit, reset } = form;

  const handleDoubleClick = () => {
    setIsEditing(true);
    reset({ name: title });
  };

  const onSubmit = async (data: TitleFormDataT) => {
    try {
      await update(materialId, data);
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при обновлении названия:', error);
    }
  };

  const handleBlur = () => {
    handleSubmit(onSubmit)();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(onSubmit)();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      reset({ name: title });
    }
  };

  if (isEditing) {
    return (
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    {...field}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      'text-text-primary h-7 w-full border-none bg-transparent p-0 text-[16px] shadow-none sm:h-9 sm:text-[28px]',
                      className,
                    )}
                    autoFocus
                    placeholder={t('titlePlaceholder')}
                    disabled={isPending}
                  />
                </FormControl>
                {fieldState.error && (
                  <p className="text-text-danger mt-1 text-sm">{fieldState.error.message}</p>
                )}
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  }

  return (
    <h3
      className={cn(
        'text-text-primary text-[16px] font-semibold break-all select-none sm:text-[28px]',
        isTutor && 'cursor-pointer',
        className,
      )}
      onDoubleClick={isTutor ? handleDoubleClick : undefined}
    >
      {title}
    </h3>
  );
};
