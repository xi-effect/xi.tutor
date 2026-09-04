import { toast } from 'sonner';
import { AxiosError } from 'axios';

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
  | 'tags'
  | 'notifications'
  | 'emailConfirmation'
  | 'emailConfirmationRequest'
  | 'scheduler';

/**
 * Только те ответы бэкенда, по которым пользователь может что-то сделать.
 * 4xx вроде 404/403/Validation Error — нормальные статусы API, в toast не идут.
 */
const userFacingDetails: Partial<Record<ErrorType, Record<string, string>>> = {
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
    'Name is required': 'Название обязательно',
  },
  addInvitation: {
    'Invitation quantity exceeded': 'Превышено количество приглашений',
    'Quantity exceeded':
      'Достигнут лимит ссылок. Используйте уже созданную — она подходит для нескольких учеников.',
  },
  addInvoiceTemplate: {
    'Quantity exceeded': 'Превышено допустимое количество шаблонов',
  },
  acceptInvite: {
    'Already joined': 'Вы уже приняли это приглашение',
    'Target is the source': 'Репетитор не может принять собственное приглашение',
  },
  createGroup: {
    'Group name already exists': 'Группа с таким названием уже существует',
  },
  files: {
    'Invalid file format': 'Недопустимый тип файла',
  },
  tags: {
    'Tag already exists': 'Тег с таким названием уже существует',
    'Quantity exceeded': 'Достигнут лимит тегов',
  },
  emailConfirmation: {
    'Too many emails': 'Слишком много запросов. Попробуйте позже',
    'Email already confirmed': 'Email уже подтвержден',
    'Invalid token': 'Неверная ссылка подтверждения',
  },
  emailConfirmationRequest: {
    'Email already confirmed': 'Email уже подтвержден',
    'Invalid token': 'Неверная ссылка подтверждения',
  },
};

const FILE_TOO_LARGE = 'Файл слишком большой. Изображения — до 1 МБ, остальные — до 5 МБ';
const FILE_UNSUPPORTED = 'Недопустимый формат файла';
const ACTION_FAILED = 'Не получилось выполнить действие. Попробуйте позже.';

const readDetail = (error: AxiosError): string | undefined => {
  const data = error.response?.data;
  if (typeof data !== 'object' || data === null || !('detail' in data)) {
    return undefined;
  }

  const { detail } = data;
  return typeof detail === 'string' ? detail : undefined;
};

/**
 * Текст для toast: null, если пользователю не нужно ничего объяснять.
 */
export const getUserFacingErrorMessage = (error: unknown, type: ErrorType): string | null => {
  if (!(error instanceof AxiosError)) {
    return null;
  }

  const status = error.response?.status;
  const detail = readDetail(error);

  if (type === 'emailConfirmationRequest' && status === 401) {
    return 'Пользователь не найден';
  }

  if (detail && userFacingDetails[type]?.[detail]) {
    return userFacingDetails[type][detail];
  }

  if (type === 'files' && (status === 413 || status === 415 || status === 422)) {
    return status === 413 ? FILE_TOO_LARGE : FILE_UNSUPPORTED;
  }

  if (typeof status === 'number' && status >= 500) {
    return ACTION_FAILED;
  }

  return null;
};

/**
 * Сообщение для UI (формы, инлайн). Для неизвестных 4xx не подставляет статус бэкенда.
 */
export const getApiErrorMessage = (error: unknown, type: ErrorType): string =>
  getUserFacingErrorMessage(error, type) ?? ACTION_FAILED;

export const handleError = (error: unknown, type: ErrorType): void => {
  const message = getUserFacingErrorMessage(error, type);
  if (message) {
    toast.error(message);
  }
};

const successMessages: Record<ErrorType, string> = {
  profile: 'Профиль успешно обновлен',
  email: 'Email успешно обновлен. Проверьте почту для подтверждения.',
  password: 'Пароль успешно обновлен',
  resetPassword: 'Пароль изменён',
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
  tags: 'Тег сохранён',
  notifications: 'Уведомление успешно отмечено как прочитанное',
  emailConfirmation: 'Письмо для подтверждения email было отправлено',
  emailConfirmationRequest: 'Почта успешно подтверждена',
  scheduler: 'Операция с расписанием выполнена',
};

export const showSuccess = (type: ErrorType, message?: string): void => {
  if (message) {
    toast.success(message);
  } else {
    toast.success(successMessages[type]);
  }
};
