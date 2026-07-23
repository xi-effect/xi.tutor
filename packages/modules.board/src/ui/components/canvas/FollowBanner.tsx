import { Button } from '@xipkg/button';
import { Close, Eyeon, Podcast } from '@xipkg/icons';
import type { DrInstancePresence, DrInstancePresenceID } from '@ibodr/draw';
import { useYjsContext } from '../../../providers/YjsProvider';
import { useFollowUserStore } from '../../../store';

export const FollowBanner = () => {
  const { store } = useYjsContext();
  const { followingPresenceId, setFollowingPresenceId, broadcasterPresenceId } =
    useFollowUserStore();

  if (!followingPresenceId) return null;

  const presence = store.get(followingPresenceId as DrInstancePresenceID) as
    DrInstancePresence | undefined;
  const name = presence?.userName || 'Участник';

  const isBroadcastForced =
    !!broadcasterPresenceId && followingPresenceId === broadcasterPresenceId;

  return (
    <div
      className="pointer-events-auto absolute top-1 left-1/2 z-100 -translate-x-1/2"
      role="status"
      aria-live="polite"
    >
      <div className="border-border-default bg-background-surface flex items-center gap-2 rounded-full border py-2 pr-2 pl-4 shadow-lg">
        {isBroadcastForced ? (
          <Podcast className="fill-icon-brand size-5 shrink-0" />
        ) : (
          <Eyeon className="fill-icon-primary size-5 shrink-0" />
        )}
        <span className="text-text-primary text-sm font-medium">
          {isBroadcastForced ? `Презентация · ${name}` : `Следуем за ${name}`}
        </span>
        {!isBroadcastForced && (
          <Button
            type="button"
            variant="none"
            className="hover:bg-background-subtle h-8 w-8 shrink-0 rounded-full p-0"
            onClick={() => setFollowingPresenceId(null)}
            title="Отключить следование"
            data-umami-event="board-follow-user-stop"
          >
            <Close className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
