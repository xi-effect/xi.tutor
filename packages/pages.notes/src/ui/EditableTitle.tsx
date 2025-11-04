import { useState } from 'react';
import { useForm } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { Form, FormControl, FormField, FormItem } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@xipkg/utils';
import { useMaterialUpdate } from '../hooks';

const titleSchema = z.object({
  name: z.string().min(1, 'Название не может быть пустым').max(100, 'Название слишком длинное'),
});

type TitleFormDataT = z.infer<typeof titleSchema>;

type EditableTitlePropsT = {
  title: string;
  materialId: string;
  className?: string;
};

export const EditableTitle = ({ title, materialId, className }: EditableTitlePropsT) => {
  const [isEditing, setIsEditing] = useState(false);
  const { update, isPending } = useMaterialUpdate();

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
                      'text-l-base sm:text-h6 xl:text-h3 h-7 w-full border-none bg-transparent p-0 shadow-none sm:h-9 xl:h-12',
                      className,
                    )}
                    autoFocus
                    placeholder="Введите название"
                    disabled={isPending}
                  />
                </FormControl>
                {fieldState.error && (
                  <p className="text-red-80 mt-1 text-sm">{fieldState.error.message}</p>
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
        'text-l-base sm:text-h6 xl:text-h3 cursor-pointer font-semibold break-all select-none',
        className,
      )}
      onDoubleClick={handleDoubleClick}
    >
      {title}
    </h3>
  );
};
