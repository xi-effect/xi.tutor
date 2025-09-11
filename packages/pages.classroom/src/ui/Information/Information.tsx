import { useForm } from '@xipkg/form';
import { Editor } from 'modules.editor';
import { Input } from '@xipkg/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@xipkg/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@xipkg/form';
import { useDebounce } from '@xipkg/utils';
import { useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetClassroom } from 'common.services';

interface FormData {
  status: string;
  subject: string;
  phone: string;
}

export const Information = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));
  const form = useForm<FormData>();
  const formValues = form.watch();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  const debouncedValues = useDebounce(formValues, 1000);

  useEffect(() => {
    form.handleSubmit(onSubmit)();
  }, [debouncedValues, form]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="order-2 flex h-full w-full flex-1 justify-center md:order-1">
          <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
        </div>
        <div className="order-1 w-full md:order-2 md:w-[300px]">
          <div className="flex flex-col gap-6">
            <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-xl font-medium text-gray-900">Ошибка загрузки данных</h2>
        <p className="text-gray-600">Не удалось загрузить информацию о кабинете</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="order-2 flex h-full w-full flex-1 justify-center md:order-1">
        <Editor />
      </div>

      <div className="order-1 w-full md:order-2 md:w-[300px]">
        <Form {...form}>
          <form className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-m-base dark:text-gray-100">Статус занятий</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="dark:text-gray-80 h-[32px] w-full">
                        <SelectValue className="w-full" placeholder="Статус занятий" />
                      </SelectTrigger>
                      <SelectContent className="dark:text-gray-80 w-full">
                        <SelectItem value="active">Активные</SelectItem>
                        <SelectItem value="paused">На паузе</SelectItem>
                        <SelectItem value="locked">Заблокированные</SelectItem>
                        <SelectItem value="finished">Завершённые</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Предмет</FormLabel>
                  <FormControl>
                    <Input variant="s" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Телефон</FormLabel>
                  <FormControl>
                    <Input variant="s" {...field} type="tel" />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
};
