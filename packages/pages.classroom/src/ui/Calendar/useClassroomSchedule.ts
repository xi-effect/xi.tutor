import { useContext } from 'react';
import { ClassroomScheduleContext } from './classroomScheduleCtx';

export const useClassroomSchedule = () => {
  const ctx = useContext(ClassroomScheduleContext);
  if (!ctx) {
    throw new Error('useClassroomSchedule must be used within ClassroomScheduleProvider');
  }
  return ctx;
};

/** Для компонентов вне вкладки Расписания и на время HMR провайдера. */
export const useClassroomScheduleOptional = () => useContext(ClassroomScheduleContext);
