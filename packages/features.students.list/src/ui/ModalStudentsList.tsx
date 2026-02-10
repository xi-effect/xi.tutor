import { Button } from '@xipkg/button';
import { Search, Trash } from '@xipkg/icons';
import { Input } from '@xipkg/input';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { UserProfile } from '@xipkg/userprofile';
import { cn } from '@xipkg/utils';
import { useState } from 'react';
import { useDeleteStudent } from '../services';
import { useStudentsList } from 'common.services';
import { TutorStudentSchemaMarshal } from 'common.types';

export const ModalStudentsList = ({ children }: { children: React.ReactNode }) => {
  const [isDelete, setIsDelete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: students, isLoading, isError } = useStudentsList();
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();

  const handleDeleteMode = (studentId: number) => {
    setSelectedStudent(studentId);
    setIsDelete(true);
  };

  const handleDelete = () => {
    if (selectedStudent) {
      deleteStudent(selectedStudent, {
        onSuccess: () => {
          setIsDelete(false);
          setSelectedStudent(null);
        },
      });
    }
  };

  const filteredStudents =
    students?.filter(
      (student: TutorStudentSchemaMarshal) =>
        student.user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.user.username.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    <Modal>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent onClose={() => setIsDelete(false)}>
        {!isDelete && (
          <ModalHeader>
            <ModalCloseButton />
            <ModalTitle className="dark:text-gray-100">Список учеников</ModalTitle>
          </ModalHeader>
        )}
        <ModalBody className={cn('flex flex-col gap-4 px-2 pt-2', isDelete && 'w-full gap-1 p-8')}>
          {!isDelete && (
            <>
              <div className="flex flex-col gap-2 px-2">
                <Input
                  placeholder="Поиск"
                  before={<Search className="fill-gray-60" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
                  {!isLoading && !isError && filteredStudents.length === 0 && (
                    <div className="flex h-20 items-center justify-center">
                      <span className="text-gray-60">
                        {searchQuery ? 'Студенты не найдены' : 'У вас пока нет студентов'}
                      </span>
                    </div>
                  )}
                  {!isLoading &&
                    !isError &&
                    filteredStudents.map((student: TutorStudentSchemaMarshal) => (
                      <div
                        key={student.tutorship.student_id}
                        className="group hover:bg-gray-5 flex h-[48px] flex-row items-center gap-2 rounded-2xl px-4"
                      >
                        <UserProfile
                          text={student.user.display_name || student.user.username}
                          userId={student.tutorship.student_id}
                        />
                        <Tooltip delayDuration={500}>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => handleDeleteMode(student.tutorship.student_id)}
                              className="bg-gray-5 hover:bg-gray-0 ml-auto size-8 rounded-lg p-0"
                              variant="none"
                              size="s"
                              data-umami-event="student-delete-init"
                              data-umami-event-student-id={student.tutorship.student_id}
                            >
                              <Trash className="size-4 fill-gray-100" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>Удалить ученика из вашего пространства</span>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </>
          )}
          {isDelete && (
            <>
              <span className="text-xl-base text self-center font-semibold text-gray-100">
                Удалить ученика?
              </span>
              <span className="text-l-base text-gray-60 w-[300px] self-center text-center">
                Если решите возобновить занятия, ученика придется приглашать заново
              </span>
              <div className="mt-3 flex flex-col gap-2">
                <Button
                  onClick={handleDelete}
                  className="w-full rounded-2xl"
                  variant="error"
                  size="l"
                  disabled={isDeleting}
                  data-umami-event="student-delete-confirm"
                  data-umami-event-student-id={selectedStudent}
                >
                  {isDeleting ? 'Удаление...' : 'Удалить'}
                </Button>
                <Button
                  onClick={() => setIsDelete(false)}
                  className="w-full rounded-2xl"
                  variant="none"
                  size="l"
                  disabled={isDeleting}
                  data-umami-event="student-delete-cancel"
                >
                  Отмена
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
