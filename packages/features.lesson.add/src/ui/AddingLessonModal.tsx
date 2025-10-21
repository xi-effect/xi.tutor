import { Modal, ModalContent, ModalTitle, ModalFooter, ModalCloseButton } from '@xipkg/modal';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@xipkg/form';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { useAddingForm } from '../hooks';
import type { FormData } from '../model';
import { StudentSelector } from './StudentSelector';
import { DayCalendar } from './DayCalendar';

type AddingLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const AddingLessonModal = ({ open, onOpenChange }: AddingLessonModalProps) => {
  const { form, control, handleSubmit, handleClearForm, onSubmit } = useAddingForm();

  const handleCloseModal = () => {
    handleClearForm();
    onOpenChange(false);
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
    handleCloseModal();
  };

  return (
    <Modal open={open} onOpenChange={handleCloseModal}>
      <ModalContent className="max-w-[1100px] p-4 md:w-[1100px]">
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0 dark:fill-gray-100" />
        </ModalCloseButton>
        <div className="flex justify-between gap-8">
          <div className="w-full">
            <DayCalendar day={new Date()} />
          </div>
          <div className="w-full">
            <ModalTitle className="mb-4 p-0 dark:text-gray-100">Назначение занятия</ModalTitle>
            <Form {...form}>
              <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
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
                            <Input {...field} variant="s" placeholder="12:00" />
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
                            <Input {...field} variant="s" placeholder="13:00" />
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
                            <Input {...field} variant="s" placeholder="Date" />
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
                            <Input {...field} variant="s" placeholder="Сделать регулярным" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <ModalFooter className="flex justify-end gap-4 px-0">
                  <Button
                    className="w-[128px] rounded-2xl"
                    size="m"
                    variant="secondary"
                    onClick={handleCloseModal}
                  >
                    Отменить
                  </Button>
                  <Button className="w-[128px] rounded-2xl" type="submit" size="m">
                    Назначить
                  </Button>
                </ModalFooter>
              </form>
            </Form>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
