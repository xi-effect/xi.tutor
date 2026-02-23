import type { SubmitEvent } from 'react';

/**
 * Минимальный интерфейс формы, чтобы не зависеть от конкретной версии react-hook-form
 * (у @xipkg/form может быть своя копия, типы тогда расходятся).
 */
interface FormWithSetValue<T extends Record<string, unknown>> {
  setValue: (name: keyof T & string, value: unknown, opts?: { shouldValidate?: boolean }) => void;
  handleSubmit: (onSubmit: (data: T) => void) => (e: SubmitEvent<HTMLFormElement>) => void;
}

/**
 * На iOS Safari автозаполнение обновляет только DOM и не вызывает input/change,
 * из‑за чего react-hook-form не получает значения и валидация падает.
 * Хук возвращает обёртку над handleSubmit: перед отправкой синхронизирует
 * значения из DOM в состояние формы, затем запускает обычную отправку.
 */
export function useSyncAutofillOnSubmit<T extends Record<string, unknown>>(
  form: FormWithSetValue<T>,
) {
  return (onSubmit: (data: T) => void) => (e: SubmitEvent<HTMLFormElement>) => {
    const formEl = e.currentTarget;
    for (const el of formEl.elements) {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        const name = el.name;
        if (name && el.value !== undefined) {
          form.setValue(name, el.value, { shouldValidate: false });
        }
      }
    }
    form.handleSubmit(onSubmit)(e);
  };
}
