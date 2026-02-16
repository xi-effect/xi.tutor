import { Button } from '@xipkg/button';
import { Eyeon } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useEffect, useState } from 'react';
import type { TLInstancePresence } from 'tldraw';
import { useCurrentUser } from 'common.services';
import { useYjsContext } from '../../../providers/YjsProvider';
import { useFollowUserStore } from '../../../store';

const AVATAR_API_BASE = 'https://api.sovlium.ru/files/users';

/**
 * Аватары всех пользователей на доске (как в Miro): себя + остальных.
 * При наведении на чужой аватар — иконка глазика; по клику камера следует за видом этого пользователя.
 * Когда режим включён — надпись «Следуем за X» и отмена показываются в плавающем баннере над канвасом (FollowBanner).
 */
export const CollaboratorAvatars = () => {
  const { store, myPresenceId, status } = useYjsContext();
  const { followingPresenceId, setFollowingPresenceId } = useFollowUserStore();
  const { data: currentUser } = useCurrentUser();
  const [allPresences, setAllPresences] = useState<TLInstancePresence[]>([]);

  useEffect(() => {
    if (status !== 'synced-remote') {
      setAllPresences([]);
      return;
    }
    const update = () => {
      try {
        const presences = store.query.records('instance_presence').get() as TLInstancePresence[];
        setAllPresences(presences);
      } catch {
        const fallback = store
          .allRecords()
          .filter((r): r is TLInstancePresence => r.typeName === 'instance_presence');
        setAllPresences(fallback);
      }
    };
    update();
    const unsub = store.listen(update, { scope: 'presence' });
    const intervalId = window.setInterval(update, 1500);
    return () => {
      unsub();
      window.clearInterval(intervalId);
    };
  }, [store, status]);

  if (allPresences.length === 0 && !followingPresenceId) return null;

  const myAvatarUrl =
    currentUser?.id != null ? `${AVATAR_API_BASE}/${currentUser.id}/avatar.webp` : undefined;

  return (
    <div className="flex items-center gap-3">
      {allPresences.length > 0 && (
        <div className="flex shrink-0 items-center gap-2">
          {allPresences.map((presence) => {
            const isMe = presence.id === myPresenceId;
            const isFollowing = followingPresenceId === presence.id;
            const name = presence.userName || 'Участник';
            const initial = name.charAt(0).toUpperCase();
            const avatarUrl = isMe ? myAvatarUrl : getAvatarUrlFromPresence(presence);
            return (
              <CollaboratorAvatarButton
                key={presence.id}
                initial={initial}
                color={presence.color}
                name={isMe ? 'Вы' : name}
                avatarUrl={avatarUrl}
                isMe={isMe}
                isFollowing={isFollowing}
                onFollow={
                  isMe ? undefined : () => setFollowingPresenceId(isFollowing ? null : presence.id)
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

/** URL аватарки из meta presence (backendUserId кладётся при отправке своей presence в useYjsStore) */
function getAvatarUrlFromPresence(presence: TLInstancePresence): string | undefined {
  const meta = presence.meta as Record<string, unknown> | undefined;
  if (!meta || typeof meta !== 'object') return undefined;
  const id = meta.backendUserId;
  if (id == null) return undefined;
  const idStr = typeof id === 'number' ? String(id) : typeof id === 'string' ? id : undefined;
  if (!idStr) return undefined;
  return `${AVATAR_API_BASE}/${idStr}/avatar.webp`;
}

type CollaboratorAvatarButtonProps = {
  initial: string;
  color: string;
  name: string;
  avatarUrl?: string;
  isMe: boolean;
  isFollowing: boolean;
  onFollow: (() => void) | undefined;
};

const CollaboratorAvatarButton = ({
  initial,
  color,
  name,
  avatarUrl,
  isMe,
  isFollowing,
  onFollow,
}: CollaboratorAvatarButtonProps) => {
  const [hover, setHover] = useState(false);
  const [imgError, setImgError] = useState(false);
  const canFollow = !isMe && onFollow != null;
  const showEye = canFollow && (hover || isFollowing);
  const showImage = avatarUrl && !imgError;

  return (
    <Button
      type="button"
      variant="none"
      className={cn(
        'relative h-8 w-8 shrink-0 rounded-full p-0 transition-all',
        isMe && 'ring-gray-30 ring-offset-gray-0 ring-2 ring-offset-2',
        isFollowing && 'ring-brand-50 ring-offset-gray-0 ring-2 ring-offset-2',
      )}
      onClick={onFollow ?? undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={
        isMe ? name : isFollowing ? `Следить за ${name} (клик — отключить)` : `Следить за ${name}`
      }
      data-umami-event={isMe ? undefined : 'board-follow-user'}
      data-umami-event-state={isMe ? undefined : isFollowing ? 'stop' : 'start'}
      disabled={!canFollow}
    >
      <div
        className={cn(
          'relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white',
          isMe && 'opacity-90',
        )}
        style={showImage ? undefined : { backgroundColor: color }}
      >
        {showImage ? (
          <img
            key={avatarUrl}
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{initial}</span>
        )}
        {showEye && (
          <span className="bg-gray-90/50 absolute inset-0 flex items-center justify-center rounded-full">
            <Eyeon className="size-4 shrink-0 fill-white" />
          </span>
        )}
      </div>
    </Button>
  );
};
