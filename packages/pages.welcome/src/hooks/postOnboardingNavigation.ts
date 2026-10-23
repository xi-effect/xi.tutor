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
