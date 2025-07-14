import { toast } from 'sonner';
import { AxiosError } from 'axios';

// Типы ошибок для разных операций
export type ErrorType =
  | 'profile'
  | 'email'
  | 'password'
  | 'resetPassword'
  | 'materials'
  | 'role'
  | 'addInvitation'
  | 'deleteInvitation';

// Маппинг ошибок для разных операций
const errorMessages: Record<ErrorType, Record<string, string>> = {
  profile: {
    'Username already in use': 'Такое имя пользователя уже занято',
    'Display name already in use': 'Такое отображаемое имя уже занято',
    'Wrong password': 'Неверный пароль',
  },
  email: {
    'Email already in use': 'Аккаунт с такой почтой уже зарегистрирован',
    'Invalid email format': 'Неверный формат email',
    'Wrong password': 'Неверный пароль',
  },
  password: {
    'Wrong password': 'Неверный текущий пароль',
    'Passwords do not match': 'Пароли не совпадают',
    'Password too weak': 'Пароль слишком слабый',
    'New password same as old': 'Новый пароль должен отличаться от текущего',
  },
  resetPassword: {
    'Token expired': 'Ссылка для сброса пароля истекла',
    'Invalid token': 'Недействительная ссылка для сброса пароля',
    'Password too weak': 'Пароль слишком слабый',
    'Invalid password format': 'Неверный формат пароля',
  },
  materials: {
    'Invalid material type': 'Неверный тип',
    'Name is required': 'Название обязательно',
  },
  role: {
    'Invalid role value': 'Неверное значение роли',
  },
  addInvitation: {
    'Invitation quantity exceeded': 'Превышено количество приглашений',
  },
  deleteInvitation: {
    'Validation Error': 'Ошибка валидации',
    'Invitation not found': 'Приглашение не найдено',
    'Invitation access denied': 'Доступ к приглашению запрещён',
  },
};

// Общие сообщения об ошибках по статусам
const statusMessages: Record<number, string> = {
  400: 'Неверные данные',
  401: 'Необходима авторизация',
  403: 'Недостаточно прав',
  404: 'Ресурс не найден',
  422: 'Ошибка валидации данных',
  500: 'Внутренняя ошибка сервера',
};

// Успешные сообщения
const successMessages: Record<ErrorType, string> = {
  profile: 'Профиль успешно обновлен',
  email: 'Email успешно обновлен. Проверьте почту для подтверждения.',
  password: 'Пароль успешно обновлен',
  resetPassword: 'Пароль успешно сброшен',
  materials: 'Материал успешно создан',
  role: 'Роль пользователя успешно обновлена',
  addInvitation: 'Новое приглашение добавлено',
  deleteInvitation: 'Приглашение удалено',
};

/**
 * Обрабатывает ошибки и показывает соответствующие toast уведомления
 */
export const handleError = (error: unknown, type: ErrorType): void => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    // Проверяем специфичные ошибки для типа операции
    if (detail && errorMessages[type][detail]) {
      toast.error(errorMessages[type][detail]);
      return;
    }

    // Проверяем общие ошибки по статусу
    if (status && statusMessages[status]) {
      toast.error(statusMessages[status]);
      return;
    }

    // Общая ошибка для типа операции
    toast.error(`Произошла ошибка при ${getOperationName(type)}`);
  } else {
    toast.error('Произошла неизвестная ошибка');
  }
};

/**
 * Показывает успешное уведомление
 */
export const showSuccess = (type: ErrorType, message?: string): void => {
  if (message) {
    toast.success(message);
  } else {
    toast.success(successMessages[type]);
  }
};

/**
 * Возвращает название операции для сообщений об ошибках
 */
const getOperationName = (type: ErrorType): string => {
  switch (type) {
    case 'profile':
      return 'обновлении профиля';
    case 'email':
      return 'обновлении email';
    case 'password':
      return 'обновлении пароля';
    case 'resetPassword':
      return 'сбросе пароля';
    case 'materials':
      return 'создании материала';
    case 'role':
      return 'назначении роли';
    default:
      return 'выполнении операции';
  }
};
