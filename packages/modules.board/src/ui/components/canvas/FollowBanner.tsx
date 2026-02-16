import { Button } from '@xipkg/button';
import { Close, Eyeon } from '@xipkg/icons';
import type { TLInstancePresence, TLInstancePresenceID } from 'tldraw';
import { useYjsContext } from '../../../providers/YjsProvider';
import { useFollowUserStore } from '../../../store';

/**
 * Плавающий баннер в стиле Miro: по центру сверху над канвасом,
 * «Следуем за [имя]» с кнопкой отмены.
 */
export const FollowBanner = () => {
  const { store } = useYjsContext();
  const { followingPresenceId, setFollowingPresenceId } = useFollowUserStore();

  if (!followingPresenceId) return null;

  const presence = store.get(followingPresenceId as TLInstancePresenceID) as
    | TLInstancePresence
    | undefined;
  const name = presence?.userName || 'Участник';

  return (
    <div
      className="pointer-events-auto absolute top-6 left-1/2 z-100 -translate-x-1/2"
      role="status"
      aria-live="polite"
    >
      <div className="border-gray-20 bg-gray-0 flex items-center gap-2 rounded-full border py-2 pr-2 pl-4 shadow-lg">
        <Eyeon className="fill-gray-90 size-5 shrink-0" />
        <span className="text-gray-90 text-sm font-medium">Следуем за {name}</span>
        <Button
          type="button"
          variant="none"
          className="hover:bg-gray-10 h-8 w-8 shrink-0 rounded-full p-0"
          onClick={() => setFollowingPresenceId(null)}
          title="Отключить следование"
          data-umami-event="board-follow-user-stop"
        >
          <Close className="size-4" />
        </Button>
      </div>
    </div>
  );
};
