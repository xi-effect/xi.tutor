import { InvitationDataT } from 'common.types';

/**
 * Выбирает актуальное приглашение для показа репетитору: последнее созданное
 * приглашение без единого использования. Если такое отсутствует — `null`
 * (тогда `useCurrentInvite` создаёт новое через существующий API).
 *
 * Backend возвращает `created_at`, поэтому сортируем по нему; `id` — тай-брейк
 * на случай совпадения таймстемпов (больший `id` считается более новым).
 */
export function selectCurrentInvite(invites: InvitationDataT[]): InvitationDataT | null {
  return (
    invites
      .filter((invite) => invite.usage_count === 0)
      .sort((a, b) => {
        const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return diff !== 0 ? diff : b.id - a.id;
      })[0] ?? null
  );
}
