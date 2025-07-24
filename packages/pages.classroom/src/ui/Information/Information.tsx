/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useForm } from '@xipkg/form';
import { Editor } from 'modules.editor';
import { Input } from '@xipkg/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@xipkg/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@xipkg/form';
import { useDebounce } from '@xipkg/utils';
import { useEffect } from 'react';

interface FormData {
  status: string;
  subject: string;
  phone: string;
}

export const Information = () => {
  const form = useForm<FormData>();
  const formValues = form.watch();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  const debouncedValues = useDebounce(formValues, 1000);

  useEffect(() => {
    form.handleSubmit(onSubmit)();
  }, [debouncedValues, form]);

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
                  <FormLabel className="text-m-base">Статус занятий</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="h-[32px] w-full">
                        <SelectValue className="w-full" placeholder="Статус занятий" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="active">Активные</SelectItem>
                        <SelectItem value="completed">Завершённые</SelectItem>
                        <SelectItem value="planned">Запланированные</SelectItem>
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
