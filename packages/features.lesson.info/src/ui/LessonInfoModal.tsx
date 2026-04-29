import { useEffect, useState } from 'react';
import { ChangeLessonModal, type ChangeLessonFormData } from 'features.lesson.change';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import type { ClassroomTutorResponseSchema } from 'common.api';
import { Button } from '@xipkg/button';
import { Clock, Conference, Edit05, Redo, Trash } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { LessonInfoClassroomBlock } from './LessonInfoClassroomBlock';

export type LessonInfoChangeLessonConfig = {
  subject: string;
  participantName: string;
  participantId?: number;
  defaultTitle: string;
  defaultDescription?: string;
  onSave: (data: ChangeLessonFormData) => void;
};

export type LessonInfoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Подпись над карточкой, если нет бейджа предмета из кабинета */
  subject: string;
  /** Название занятия (как в расписании / в событии) */
  lessonTitle: string;
  /** Текстовое описание (тема, план) — показывается под названием */
  lessonDescription?: string;
  classroomId?: number;
  /** Данные кабинета (GET tutor/student classroom) — как на карточке на главной */
  classroom?: ClassroomTutorResponseSchema;
  classroomLoading?: boolean;
  startTime: string | null;
  endTime: string | null;
  onStartLesson?: () => void;
  /** Принудительно заблокировать кнопку «Начать занятие» */
  isStartLessonDisabled?: boolean;
  /** Тултип при заблокированной кнопке «Начать занятие» */
  startLessonTooltip?: string;
  onReschedule?: () => void;
  onEditLesson?: () => void;
  /**
   * Встроенная модалка «Изменить занятие» (`features.lesson.change`).
   * Если задана, кнопка «Редактировать» открывает её; иначе вызывается `onEditLesson`.
   */
  changeLesson?: LessonInfoChangeLessonConfig;
  onCancelClick?: () => void;
};

export const LessonInfoModal = ({
  open,
  onOpenChange,
  subject,
  lessonTitle,
  lessonDescription,
  classroomId,
  classroom,
  classroomLoading,
  startTime,
  endTime,
  onStartLesson,
  isStartLessonDisabled,
  startLessonTooltip,
  onReschedule,
  onEditLesson,
  changeLesson,
  onCancelClick,
}: LessonInfoModalProps) => {
  const [isChangeLessonOpen, setIsChangeLessonOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsChangeLessonOpen(false);
    }
  }, [open]);

  const showInfo = open && !isChangeLessonOpen;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setIsChangeLessonOpen(false);
      onOpenChange(false);
    }
  };

  const showEdit = changeLesson != null || onEditLesson != null;

  const showClassroomBlock = classroomId != null;
  const hasClassroomSubjectLabel = Boolean(classroom?.subject?.name?.trim());
  const showSubjectFallback =
    subject.trim().length > 0 &&
    !hasClassroomSubjectLabel &&
    (!showClassroomBlock || !classroomLoading);

  const openEdit = () => {
    if (changeLesson != null) {
      setIsChangeLessonOpen(true);
      return;
    }
    onEditLesson?.();
  };

  return (
    <>
      <Modal open={showInfo} onOpenChange={handleOpenChange}>
        <ModalContent className="relative w-full max-w-[560px]" aria-describedby={undefined}>
          <ModalHeader>
            <ModalCloseButton />
            <ModalTitle className="text-xl-base max-w-[calc(100%-56px)] font-semibold text-gray-100">
              Информация о занятии
            </ModalTitle>
          </ModalHeader>

          <ModalBody className="flex flex-col gap-4 px-6 pt-0 pb-4">
            <div className="border-gray-10 flex flex-col gap-2 rounded-2xl border bg-white p-5">
              {showSubjectFallback ? <span className="text-gray-40 text-xs">{subject}</span> : null}

              {showClassroomBlock ? (
                <LessonInfoClassroomBlock
                  classroomId={classroomId}
                  classroom={classroom}
                  classroomLoading={classroomLoading === true}
                />
              ) : null}

              <p className="text-gray-90 mt-2 text-[14px] leading-snug font-semibold">
                {lessonTitle}
              </p>

              {lessonDescription != null && lessonDescription.trim().length > 0 ? (
                <p className="text-gray-60 text-sm leading-snug">{lessonDescription.trim()}</p>
              ) : null}

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

          <ModalFooter className="xs:gap-2 flex flex-col gap-3 px-6 pb-6 sm:flex-row sm:items-stretch">
            {isStartLessonDisabled && startLessonTooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-brand-100 bg-brand-0 hover:bg-brand-20/50 h-12 min-h-12 w-full"
                      disabled
                    >
                      Начать занятие
                      <Conference className="fill-gray-40 ml-1.5 h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{startLessonTooltip}</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="text-brand-100 bg-brand-0 hover:bg-brand-20/50 h-12 min-h-12 flex-1"
                onClick={onStartLesson}
                disabled={isStartLessonDisabled}
              >
                Начать занятие
                <Conference className="fill-brand-100 ml-1.5 h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="none"
              className="bg-gray-5 text-gray-70 hover:bg-gray-10 hover:text-gray-80 h-12 min-h-12 flex-1"
              onClick={onReschedule}
            >
              Перенести
              <Redo className="fill-gray-70 ml-1.5 h-4 w-4" />
            </Button>
            {onCancelClick != null ? (
              <Button
                type="button"
                variant="none"
                className="bg-gray-5 text-gray-80 xs:w-12 flex h-12 min-h-12 w-full shrink-0 items-center justify-center p-0 hover:text-gray-100 max-sm:mx-auto"
                onClick={onCancelClick}
              >
                <span className="xs:sr-only block">Отменить</span>
                <Trash className="fill-gray-60 xs:ml-0 ml-2 h-5 w-5" />
              </Button>
            ) : null}
            {showEdit ? (
              <Button
                type="button"
                variant="none"
                className="bg-gray-5 text-gray-80 xs:w-12 flex h-12 min-h-12 w-full shrink-0 items-center justify-center p-0 hover:text-gray-100 max-sm:mx-auto"
                onClick={openEdit}
                aria-label="Редактировать"
              >
                <span className="xs:sr-only block">Редактировать</span>
                <Edit05 className="text-gray-60 xs:ml-0 ml-2 h-5 w-5" />
              </Button>
            ) : null}
          </ModalFooter>
        </ModalContent>
      </Modal>
      {changeLesson != null ? (
        <ChangeLessonModal
          open={open && isChangeLessonOpen}
          onOpenChange={(next) => {
            if (!next) {
              setIsChangeLessonOpen(false);
            }
          }}
          {...changeLesson}
        />
      ) : null}
    </>
  );
};
