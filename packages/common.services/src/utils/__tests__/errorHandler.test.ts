import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import {
  getApiErrorMessage,
  getUserFacingErrorMessage,
  setFileTooLargeMessage,
} from '../errorHandler';

const axiosError = (status: number, detail?: string) => {
  const error = new AxiosError('Request failed');
  error.response = {
    status,
    data: detail ? { detail } : {},
    headers: {},
    statusText: '',
    config: {} as AxiosError['response'] extends { config: infer C } ? C : never,
  } as AxiosError['response'];
  return error;
};

describe('getUserFacingErrorMessage', () => {
  it('для файлов с 413 без известного тарифа не называет лимиты', () => {
    expect(getUserFacingErrorMessage(axiosError(413), 'files')).toBe('Файл слишком большой');
  });

  it('для файлов с 413 подставляет лимиты текущего тарифа', () => {
    setFileTooLargeMessage(() => 'Лимит тарифа');
    try {
      expect(getUserFacingErrorMessage(axiosError(413), 'files')).toBe('Лимит тарифа');
    } finally {
      setFileTooLargeMessage(null);
    }
  });

  it('для файлов с 415 объясняет формат', () => {
    expect(getUserFacingErrorMessage(axiosError(415), 'files')).toBe('Недопустимый формат файла');
  });

  it('не показывает обычные 4xx без понятного detail', () => {
    expect(getUserFacingErrorMessage(axiosError(404), 'files')).toBeNull();
    expect(getUserFacingErrorMessage(axiosError(403), 'classroom')).toBeNull();
    expect(getUserFacingErrorMessage(axiosError(400, 'Validation Error'), 'classroom')).toBeNull();
    expect(getUserFacingErrorMessage(axiosError(400, 'File not found'), 'files')).toBeNull();
  });

  it('объясняет, что кабинет доступен только для чтения', () => {
    expect(getUserFacingErrorMessage(axiosError(409, 'Classroom is read-only'), 'classroom')).toBe(
      'Кабинет недоступен для изменений',
    );
    expect(
      getUserFacingErrorMessage(axiosError(409, 'Classroom is read-only'), 'deleteStudent'),
    ).toBe('Кабинет недоступен для изменений');
  });

  it('объясняет лимит активных кабинетов', () => {
    expect(getUserFacingErrorMessage(axiosError(409, 'Quantity exceeded'), 'createGroup')).toBe(
      'Достигнут лимит активных кабинетов',
    );
    expect(getUserFacingErrorMessage(axiosError(429), 'classroom')).toBe(
      'Достигнут лимит активных кабинетов',
    );
    expect(
      getUserFacingErrorMessage(axiosError(409, 'Group name already exists'), 'createGroup'),
    ).toBe('Группа с таким названием уже существует');
  });

  it('показывает конфликт, который пользователь может исправить', () => {
    expect(getUserFacingErrorMessage(axiosError(409, 'Username already in use'), 'profile')).toBe(
      'Такое имя пользователя уже занято',
    );
    expect(getUserFacingErrorMessage(axiosError(409, 'Quantity exceeded'), 'tags')).toBe(
      'Достигнут лимит тегов',
    );
  });

  it('для 5xx на действии пользователя предлагает повторить позже', () => {
    expect(getUserFacingErrorMessage(axiosError(500), 'materials')).toBe(
      'Не получилось выполнить действие. Попробуйте позже.',
    );
  });

  it('не показывает сырой Network Error', () => {
    expect(getUserFacingErrorMessage(new Error('Network Error'), 'files')).toBeNull();
  });
});

describe('getApiErrorMessage', () => {
  it('для неизвестной ошибки не подставляет статус бэкенда', () => {
    expect(getApiErrorMessage(axiosError(404), 'files')).toBe(
      'Не получилось выполнить действие. Попробуйте позже.',
    );
  });
});
