import { useParams, useSearch } from '@tanstack/react-router';

/** Токен из path-параметра ($resetToken) или из query (?token=). Path-параметр декодируется. */
export function useResetPasswordToken(): string | undefined {
  const { resetToken } = useParams({ strict: false });
  const search = useSearch({ strict: false }) as { token?: string } | undefined;
  if (resetToken) return decodeURIComponent(resetToken);
  return search?.token;
}
