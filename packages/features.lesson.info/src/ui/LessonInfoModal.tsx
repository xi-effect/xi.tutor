import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { Clock, Conference, Edit, Redo, Trash } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';

export type LessonInfoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  teacherName: string;
  teacherId?: number;
  lessonTitle: string;
  startTime: string | null;
  endTime: string | null;
  onStartLesson?: () => void;
  onReschedule?: () => void;
  onEditLesson?: () => void;
  onCancelLesson?: () => void;
};

export const LessonInfoModal = ({
  open,
  onOpenChange,
  subject,
  teacherName,
  teacherId,
  lessonTitle,
  startTime,
  endTime,
  onStartLesson,
  onReschedule,
  onEditLesson,
  onCancelLesson,
}: LessonInfoModalProps) => {
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onOpenChange(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="relative w-full max-w-[560px]" aria-describedby={undefined}>
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle className="text-xl-base max-w-[calc(100%-56px)] font-semibold text-gray-100">
            Информация о занятии
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="flex flex-col gap-4 px-6 pt-0 pb-4">
          <div className="border-gray-10 flex flex-col gap-2 rounded-2xl border bg-white p-5">
            <span className="text-gray-40 text-xs">{subject}</span>

            <div className="flex items-center gap-2">
              <UserProfile size="s" userId={teacherId ?? 0} text={teacherName} />
            </div>

            <p className="text-gray-90 mt-2 text-[14px] leading-snug font-semibold">
              {lessonTitle}
            </p>

            {startTime != null && endTime != null && (
              <div className="mt-2 flex w-full items-center gap-2">
                <div className="flex items-center gap-1">
                  <Clock className="fill-gray-40 h-4 w-4 shrink-0" />
                  <span className="text-gray-90 text-[14px]">{startTime}</span>
                </div>
                <span className="bg-gray-30 dark:bg-gray-60 h-px flex-1 shrink-0" aria-hidden />
                <div className="text-gray-90 flex items-center gap-1 text-sm dark:text-gray-100">
                  <Clock className="fill-gray-40 h-4 w-4 shrink-0" />
                  <span className="text-gray-90 text-xs-base-size">{endTime}</span>
                </div>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex flex-col gap-2 px-6 pb-6 sm:flex-row sm:items-stretch">
          <Button
            type="button"
            variant="ghost"
            className="text-brand-100 bg-brand-0 hover:bg-brand-20/50 h-12 flex-1"
            onClick={onStartLesson}
          >
            Начать занятие
            <Conference className="fill-brand-100 ml-1.5 h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="none"
            className="bg-gray-5 text-gray-70 hover:bg-gray-10 hover:text-gray-80 h-12 flex-1"
            onClick={onReschedule}
          >
            Перенести
            <Redo className="fill-gray-70 ml-1.5 h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="none"
            className="bg-gray-5 text-gray-80 flex h-12 w-12 shrink-0 items-center justify-center p-0 hover:text-gray-100 max-sm:mx-auto"
            onClick={onCancelLesson}
          >
            <Trash className="fill-gray-60 h-5 w-5" />
          </Button>
          {onEditLesson != null ? (
            <Button
              type="button"
              variant="none"
              className="bg-gray-5 text-gray-80 flex h-12 w-12 shrink-0 items-center justify-center p-0 hover:text-gray-100 max-sm:mx-auto"
              onClick={onEditLesson}
              aria-label="Редактировать"
            >
              <Edit className="fill-gray-60 h-5 w-5" />
            </Button>
          ) : null}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
