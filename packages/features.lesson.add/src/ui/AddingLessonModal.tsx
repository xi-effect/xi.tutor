import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalCloseButton,
} from '@xipkg/modal';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@xipkg/form';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { useInvoiceForm } from '../hooks';
import type { FormData } from '../model';
import { StudentSelector } from './StudentSelector';

type AddingLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const AddingLessonModal = ({ open, onOpenChange }: AddingLessonModalProps) => {
  const {
    form,
    control,
    handleSubmit,
    handleClearForm,
    onSubmit,
  } = useInvoiceForm();


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
      <ModalContent className="max-w-[1100px] md:w-[1100px]">
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0 dark:fill-gray-100" />
        </ModalCloseButton>
        <div className='flex gap-8'>
          <div>
           <h5>Вторник, 23 сентября</h5> 
           <p>Здесь будет календарь на день</p>
          </div>
          <div>
            <ModalHeader className="border-gray-20 border-b">
          <ModalTitle className="dark:text-gray-100">Назначение занятия</ModalTitle>
        </ModalHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
          <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input
                  {...field}
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
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Input
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
            <StudentSelector control={control} />

            <ModalFooter className="flex gap-4">
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
