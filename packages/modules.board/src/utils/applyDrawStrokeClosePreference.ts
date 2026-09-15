/**
 * Карандаш в ibodr замыкает штрих, если конец близко к началу (`isClosed`).
 * На планшете со стилусом это срабатывает слишком часто и заливает контур.
 */
export function applyDrawStrokeClosePreference<T>(shape: T, autoClose: boolean): T {
  if (autoClose) return shape;

  const record = shape as { type?: string; props?: { isClosed?: boolean } };
  if (record.type !== 'draw' || record.props?.isClosed !== true) return shape;

  return {
    ...record,
    props: {
      ...record.props,
      isClosed: false,
    },
  } as T;
}
