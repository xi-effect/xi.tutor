/* eslint-disable no-irregular-whitespace */
import {
  Modal,
  ModalTitle,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalTrigger,
  ModalCloseButton,
} from '@xipkg/modal';
import { ScrollArea } from '@xipkg/scrollarea';
import { UserProfile } from '@xipkg/userprofile';
import { cn } from '@xipkg/utils';
import { TutorStudentSchemaMarshal } from 'common.types';
import { useStudentsList } from 'common.services';

export const ModalStudentsGroup = ({ children }: { children: React.ReactNode }) => {
  const { data: students, isLoading, isError } = useStudentsList();

  console.log('students', students);

  return (
    <Modal>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle className="dark:text-gray-100">Добавление ученика в группу</ModalTitle>
        </ModalHeader>
        <ModalBody className={cn('flex flex-col gap-4 px-2 pt-2')}>
          <ScrollArea className="h-[300px]">
            <div className="flex flex-col">
              {isLoading && (
                <div className="flex h-20 items-center justify-center">
                  <span className="text-gray-60">Загрузка...</span>
                </div>
              )}
              {isError && (
                <div className="flex h-20 items-center justify-center">
                  <span className="text-red-500">Ошибка загрузки данных</span>
                </div>
              )}
              {!isLoading && !isError && students?.length === 0 && (
                <div className="flex h-20 items-center justify-center">
                  <span className="text-gray-60">{'У вас пока нет студентов'}</span>
                </div>
              )}
              {!isLoading &&
                !isError &&
                students?.map((student: TutorStudentSchemaMarshal) => (
                  <div
                    key={student.tutorship.student_id}
                    className="group hover:bg-gray-5 flex h-[48px] flex-row items-center gap-2 rounded-2xl px-4"
                  >
                    <UserProfile
                      text={student.user.display_name || student.user.username}
                      userId={student.tutorship.student_id}
                    />
                  </div>
                ))}
            </div>
          </ScrollArea>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
