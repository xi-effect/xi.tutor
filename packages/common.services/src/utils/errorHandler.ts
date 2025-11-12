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
  | 'deleteInvitation'
  | 'onboarding'
  | 'addInvoiceTemplate'
  | 'deleteInvoiceTemplate'
  | 'updateInvoiceTemplate'
  | 'deleteStudent'
  | 'acceptInvite'
  | 'classroom'
  | 'calls'
  | 'createGroup'
  | 'files'
  | 'notifications'
  | 'emailConfirmation'
  | 'emailConfirmationRequest';

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
  onboarding: {
    'Invalid transition': 'Неверный режим перехода',
  },
  addInvoiceTemplate: {
    'Validation Error': 'Ошибка валидации',
    'Quantity exceeded': 'Превышено допустимое количество',
  },
  deleteInvoiceTemplate: {
    'Validation Error': 'Ошибка валидации',
    'Invoice item template not found': 'Шаблон не найден',
  },
  updateInvoiceTemplate: {
    'Validation Error': 'Ошибка валидации',
    'Invoice item template access denied': 'Доступ к шаблону запрещен',
    'Invoice item template not found': 'Шаблон не найден',
  },
  deleteStudent: {
    'Validation Error': 'Ошибка валидации',
    'Student not found': 'Ученик не найден',
  },
  acceptInvite: {
    'Validation Error': 'Ошибка валидации',
    'Invitation not found': 'Приглашение не найдено',
    'Invitation access denied': 'Доступ к приглашению запрещен',
  },
  classroom: {
    'Validation Error': 'Ошибка валидации',
    'Classroom not found': 'Класс не найден',
    'Classroom access denied': 'Доступ к классу запрещен',
    'Invalid status': 'Неверный статус класса',
  },
  calls: {
    'Validation Error': 'Ошибка валидации',
    'Access token not found': 'Access token не найден',
    'Access token access denied': 'Доступ к access token запрещен',
  },
  createGroup: {
    'Validation Error': 'Ошибка валидации',
    'Group name already exists': 'Группа с таким названием уже существует',
    'Subject not found': 'Предмет не найден',
  },
  files: {
    'Invalid file format': 'Недопустимый тип файла',
  },
  notifications: {
    'Validation Error': 'Ошибка валидации',
    'Notification not found': 'Уведомление не найдено',
    'Notification access denied': 'Доступ к уведомлению запрещен',
  },
  emailConfirmation: {
    'Too many emails': 'Слишком много запросов',
    'Email already confirmed': 'Email уже подтвержден',
    'Invalid token': 'Неверный токен',
  },
  emailConfirmationRequest: {
    'Email already confirmed': 'Email уже подтвержден',
    'Invalid token': 'Неверный токен',
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
  onboarding: 'Онбординг успешно завершен',
  addInvoiceTemplate: 'Новый шаблон на оплату добавлен',
  deleteInvoiceTemplate: 'Шаблон удален',
  updateInvoiceTemplate: 'Шаблон обновлен',
  deleteStudent: 'Ученик удален',
  acceptInvite: 'Приглашение принято',
  classroom: 'Статус класса обновлен',
  calls: 'Access token создан',
  createGroup: 'Группа успешно создана',
  files: 'Файл успешно загружен',
  notifications: 'Уведомление успешно отмечено как прочитанное',
  emailConfirmation: 'Письмо для подтверждения email было отправлено',
  emailConfirmationRequest: 'Почта успешно подтверждена',
};

/**
 * Обрабатывает ошибки и показывает соответствующие toast уведомления
 */
export const handleError = (error: unknown, type: ErrorType): void => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    console.log('status', status);
    console.log('detail', detail);
    console.log('type', type);

    if (type === 'emailConfirmationRequest' && status === 401) {
      toast.error('Пользователь не найден');
      return;
    }

    // if (type === 'emailConfirmation' && detail === 'Too many emails') {

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
    case 'onboarding':
      return 'переходе на этап онбординга';
    case 'deleteStudent':
      return 'удалении ученика';
    case 'createGroup':
      return 'создании группы';
    case 'files':
      return 'загрузке файла';
    case 'notifications':
      return 'обработке уведомления';
    default:
      return 'выполнении операции';
  }
};
