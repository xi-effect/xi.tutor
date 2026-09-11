import { useCallback } from 'react';

type UpdateAttributesFn = (attrs: Record<string, unknown>) => void;

/**
 * Общий паттерн для NodeView: прочитать атрибут ноды с дефолтом
 * и получить стабильный сеттер, пишущий его через updateAttributes.
 */
export function useNodeAttribute<T>(
  updateAttributes: UpdateAttributesFn,
  key: string,
  value: T | undefined,
  defaultValue: T,
) {
  const current = value ?? defaultValue;

  const setValue = useCallback(
    (next: T) => updateAttributes({ [key]: next }),
    [updateAttributes, key],
  );

  return [current, setValue] as const;
}
