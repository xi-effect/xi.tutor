/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Badge } from '@xipkg/badge';
import { Conference } from '@xipkg/icons';
import { ClassroomTutorResponseSchema } from 'common.api';
// import { handleTelegramClick } from '../../../utils/header';
import { IndividualUser } from './IndividualUser';
// import { EditableDescription } from './EditableDescription';
import { Button } from '@xipkg/button';
import { SubjectBadge } from './SubjectBadge';
import { useStartCall } from 'modules.calls';
import { useEffect, useCallback } from 'react';
import { useSearch } from '@tanstack/react-router';
import { StatusBadge } from '../../StatusBadge';

interface ContentProps {
  classroom: ClassroomTutorResponseSchema;
}

export const Content = ({ classroom }: ContentProps) => {
  const { startCall, isLoading } = useStartCall();
  const search = useSearch({ from: '/(app)/_layout/classrooms/$classroomId' });

  const getDisplayName = () => {
    if (classroom.kind === 'individual') {
      return `${classroom.student.first_name} ${classroom.student.last_name}`;
    } else {
      return classroom.name;
    }
  };

  const handleCallClick = useCallback(async () => {
    try {
      // Запускаем процесс создания токена, сохранения в store и навигации
      await startCall({ classroom_id: classroom.id.toString() });
    } catch (error) {
      console.error('Ошибка при запуске звонка:', error);
      // Здесь можно добавить показ уведомления об ошибке
    }
  }, [startCall, classroom.id]);

  // Перехват параметра goto=call
  useEffect(() => {
    const searchParams = search as any;

    if (searchParams.goto && searchParams.goto === 'call') {
      // Очищаем только goto параметр
      const url = new URL(window.location.href);
      url.searchParams.delete('goto');
      window.history.replaceState({}, '', url.toString());

      // Запускаем звонок
      setTimeout(() => {
        handleCallClick();
      }, 100);
    }
  }, [search, handleCallClick]);

  return (
    <div className="flex flex-row items-start pl-4">
      <div className="flex flex-col items-start gap-4">
        {classroom.kind === 'individual' ? (
          <IndividualUser userId={classroom.student_id ?? classroom.tutor_id ?? 0} />
        ) : (
          <div className="flex flex-row items-center gap-2">
            <div className="bg-brand-80 text-gray-0 flex h-12 w-12 items-center justify-center rounded-[24px]">
              {getDisplayName()?.[0].toUpperCase() ?? ''}
            </div>
            <div className="text-xl-base font-semibold text-gray-100">{getDisplayName()}</div>
          </div>
        )}
        <div className="flex flex-row items-center gap-2">
          {classroom.subject_id && <SubjectBadge subject_id={classroom.subject_id} />}

          <StatusBadge status={classroom.status} kind={classroom.kind} />

          {/* <Badge
            className="bg-brand-0 text-s-base text-brand-80 flex cursor-pointer flex-row items-center gap-2 font-medium"
            onClick={handleTelegramClick}
            variant="secondary"
            size="m"
          >
            <TelegramFilled className="fill-brand-80 size-4" />
            {`@nickname`}
          </Badge> */}
        </div>
      </div>

      <div className="ml-auto flex flex-col items-end gap-2">
        <div className="flex flex-row items-end gap-2">
          <Button onClick={handleCallClick} size="s" disabled={isLoading}>
            <Conference className="fill-gray-0 mr-2 size-4" />
            {isLoading ? 'Подключение...' : 'Начать Звонок'}
          </Button>
        </div>
      </div>
    </div>
  );
};
