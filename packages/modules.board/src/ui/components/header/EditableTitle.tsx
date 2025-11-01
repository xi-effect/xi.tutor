/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState } from 'react';
import { useForm } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { Form, FormControl, FormField, FormItem } from '@xipkg/form';
import { useUpdateClassroomMaterial, useUpdateMaterial } from 'common.services';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@xipkg/utils';
import { useParams } from '@tanstack/react-router';

const titleSchema = z.object({
  name: z.string().min(1, 'Название не может быть пустым').max(100, 'Название слишком длинное'),
});

type TitleFormData = z.infer<typeof titleSchema>;

interface EditableTitleProps {
  title: string;
  materialId: string;
  className?: string;
}

export const EditableTitle = ({ title, materialId, className }: EditableTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { classroomId } = useParams({ strict: false });

  const { updateMaterial } = useUpdateMaterial();
  const { updateClassroomMaterial } = useUpdateClassroomMaterial();

  const form = useForm<TitleFormData>({
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

  const onSubmit = async (data: TitleFormData) => {
    try {
      if (classroomId) {
        await updateClassroomMaterial.mutateAsync({
          classroomId: classroomId,
          id: materialId,
          data: { name: data.name },
        });
      } else {
        await updateMaterial.mutateAsync({
          id: materialId,
          data: { name: data.name },
        });
      }
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      'text-xl-base h-auto bg-transparent p-0 shadow-none focus-visible:ring-0',
                      className,
                    )}
                    autoFocus
                    disabled={updateMaterial.isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  }

  return (
    <h1
      className={cn('text-xl-base cursor-pointer select-none', className)}
      onDoubleClick={handleDoubleClick}
    >
      {title}
    </h1>
  );
};
