import { useEffect } from 'react';
import { useForm } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { Button } from '@xipkg/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import { useUpdateIndividualClassroom } from 'common.services';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const descriptionSchema = z.object({
  description: z.string().max(500, 'Описание слишком длинное'),
});

type DescriptionFormData = z.infer<typeof descriptionSchema>;

interface EditDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  description: string | null;
  classroomId: number;
}

export const EditDescriptionModal = ({
  isOpen,
  onClose,
  description,
  classroomId,
}: EditDescriptionModalProps) => {
  const { updateIndividualClassroom, isUpdating } = useUpdateIndividualClassroom();

  const form = useForm<DescriptionFormData>({
    resolver: zodResolver(descriptionSchema),
    defaultValues: {
      description: description || '',
    },
  });

  const { control, handleSubmit, reset } = form;

  useEffect(() => {
    if (isOpen) {
      reset({ description: description || '' });
    }
  }, [isOpen, description, reset]);

  const onSubmit = async (data: DescriptionFormData) => {
    try {
      await updateIndividualClassroom({
        classroomId,
        data: { description: data.description },
      });
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении описания:', error);
    }
  };

  const handleClose = () => {
    reset({ description: description || '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Редактировать описание</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание кабинета</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Введите описание кабинета..."
                      disabled={isUpdating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isUpdating}>
                Отмена
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
