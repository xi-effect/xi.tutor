/**
 * Типы для статусов образования
 */
export type StatusEducationT = 'active' | 'paused' | 'locked' | 'finished';

export type TypeEducationT = 'individual' | 'group';

export type SubjectT = 'all' | 'math' | 'computer_science' | 'foreign_languages' | 'other';

/**
 * Словарь переводов статусов образования для студентов
 */
export const EDUCATION_STATUS_LABELS_STUDENT: Record<StatusEducationT, string> = {
  active: 'Учусь',
  paused: 'На паузе',
  locked: 'Заблокировано',
  finished: 'Обучение завершено',
} as const;

/**
 * Словарь переводов статусов образования для преподавателей
 */
export const EDUCATION_STATUS_LABELS_TUTOR: Record<StatusEducationT, string> = {
  active: 'Учится',
  paused: 'На паузе',
  locked: 'Заблокировано',
  finished: 'Обучение завершено',
} as const;

/**
 * Основной словарь переводов статусов образования (по умолчанию для студентов)
 */
export const EDUCATION_STATUS_LABELS = EDUCATION_STATUS_LABELS_STUDENT;

/**
 * Утилитарные функции для работы со статусами образования
 */
export const educationUtils = {
  /**
   * Получить текстовое представление статуса
   */
  getStatusText: (status: StatusEducationT): string => {
    return EDUCATION_STATUS_LABELS[status];
  },

  /**
   * Получить текстовое представление статуса с учетом роли пользователя
   */
  getStatusTextByRole: (status: StatusEducationT, isTutor: boolean): string => {
    const labels = isTutor ? EDUCATION_STATUS_LABELS_TUTOR : EDUCATION_STATUS_LABELS_STUDENT;
    return labels[status];
  },

  /**
   * Получить текстовое представление статуса по строке
   */
  getStatusTextFromString: (status: string): string => {
    if (status in EDUCATION_STATUS_LABELS) {
      return EDUCATION_STATUS_LABELS[status as StatusEducationT];
    }
    return 'Неизвестно';
  },

  /**
   * Получить текстовое представление статуса по строке с учетом роли пользователя
   */
  getStatusTextFromStringByRole: (status: string, isTutor: boolean): string => {
    const labels = isTutor ? EDUCATION_STATUS_LABELS_TUTOR : EDUCATION_STATUS_LABELS_STUDENT;
    if (status in labels) {
      return labels[status as StatusEducationT];
    }
    return 'Неизвестно';
  },

  /**
   * Проверить, является ли статус валидным
   */
  isValidStatus: (status: string): status is StatusEducationT => {
    return status in EDUCATION_STATUS_LABELS;
  },

  /**
   * Получить все доступные статусы
   */
  getAllStatuses: (): StatusEducationT[] => {
    return Object.keys(EDUCATION_STATUS_LABELS) as StatusEducationT[];
  },
} as const;
