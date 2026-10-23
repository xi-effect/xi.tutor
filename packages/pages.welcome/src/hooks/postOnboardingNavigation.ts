/** Куда вести после завершения welcome: на инвайт, если код сохранён, иначе на главную. */
export function resolvePostOnboardingNavigation(
  searchInvite?: string,
  storedInviteId?: string | null,
):
  | { to: '/invite/$inviteId'; params: { inviteId: string }; clearStoredInvite: boolean }
  | { to: '/'; clearStoredInvite: false } {
  const inviteId = storedInviteId || searchInvite;

  if (inviteId) {
    return {
      to: '/invite/$inviteId',
      params: { inviteId },
      clearStoredInvite: Boolean(storedInviteId),
    };
  }

  return { to: '/', clearStoredInvite: false };
}

type PostOnboardingNavigate = (
  options: { to: '/invite/$inviteId'; params: { inviteId: string } } | { to: '/' },
) => void;

/** Навигация после welcome. Короткая пауза даёт кэшу пользователя обновиться. */
export function schedulePostOnboardingNavigation(
  searchInvite: string | undefined,
  navigate: PostOnboardingNavigate,
): void {
  window.setTimeout(() => {
    const storedInviteId =
      typeof window === 'undefined' ? null : localStorage.getItem('invite.pending_code');
    const target = resolvePostOnboardingNavigation(searchInvite, storedInviteId);

    if (target.clearStoredInvite && typeof window !== 'undefined') {
      localStorage.removeItem('invite.pending_code');
    }

    if (target.to === '/invite/$inviteId') {
      navigate({ to: target.to, params: target.params });
      return;
    }

    navigate({ to: target.to });
  }, 100);
}
