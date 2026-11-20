import { useEffect, useRef } from 'react';
import { useCurrentUser, useFetchClassrooms } from 'common.services';
import { startDemoCabinet } from './startDemoCabinet';

/**
 * На этапе training создаёт демонстрационный кабинет, если у репетитора ещё нет кабинетов.
 * Повторный заход и уже существующий кабинет создание не запускают.
 */
export const DemoCabinetOnTraining = () => {
  const { data: user } = useCurrentUser();
  const isTrainingTutor =
    user?.default_layout === 'tutor' && user.onboarding_stage === 'training' && user.id != null;
  const classrooms = useFetchClassrooms(undefined, !isTrainingTutor);
  const decidedFor = useRef<number | null>(null);

  useEffect(() => {
    if (!isTrainingTutor || user?.id == null || decidedFor.current === user.id) return;
    if (!classrooms.isSuccess || classrooms.isError) return;

    decidedFor.current = user.id;
    if ((classrooms.data?.length ?? 0) > 0) return;
    startDemoCabinet(user.id);
  }, [classrooms.data, classrooms.isError, classrooms.isSuccess, isTrainingTutor, user?.id]);

  return null;
};
