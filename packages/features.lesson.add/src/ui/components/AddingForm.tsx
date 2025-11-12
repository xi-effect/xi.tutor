import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { useMaskInput } from '@xipkg/inputmask';
import { ArrowRight, Clock } from '@xipkg/icons';
import { useAddingForm } from '../../hooks';
import { InputDate } from './InputDate';
import { RepeatBlock } from './RepeatBlock';
import { StudentSelector } from './StudentSelector';

import { useEffect, type FC, type PropsWithChildren } from 'react';
import type { FormData } from '../../model';

interface AddingFormProps extends PropsWithChildren {
  onClose: () => void;
  onDateChange: (date: Date) => void;
}

export const AddingForm: FC<AddingFormProps> = ({ children, onClose, onDateChange }) => {
  const { form, control, handleSubmit, handleClearForm, onSubmit, eventDate } = useAddingForm();

  const maskRefStartTime = useMaskInput('time');
  const maskRefEndTime = useMaskInput('time');

  const handleReset = () => {
    handleClearForm();
    onClose();
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
    onClose();
  };

  useEffect(() => {
    if (eventDate) {
      onDateChange(eventDate);
    }
  }, [eventDate, onDateChange]);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        onReset={handleReset}
        className="flex flex-col gap-4"
      >
        <div className="py-2">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="mb-2 block">Название</FormLabel>
                <FormControl>
                  <Input {...field} variant="s" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">Описание</FormLabel>
                <FormControl>
                  <Input {...field} variant="s" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="py-2">
          <StudentSelector control={control} />
        </div>
        <div className="py-2">
          <h5 className="mb-2">Время</h5>
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      ref={maskRefStartTime}
                      placeholder="00:00"
                      before={<Clock className="fill-gray-80 h-4 w-4" />}
                      variant="s"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      ref={maskRefEndTime}
                      placeholder="00:00"
                      before={<ArrowRight className="fill-gray-80 h-4 w-4" />}
                      variant="s"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputDate value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="shouldRepeat"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RepeatBlock value={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        {children}
      </form>
    </Form>
  );
};
