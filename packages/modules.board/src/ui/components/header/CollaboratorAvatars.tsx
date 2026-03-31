import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@xipkg/avatar';
import { Eyeoff, Eyeon } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { useEffect, useMemo, useState } from 'react';
import type { TLInstancePresence } from 'tldraw';
import { useCurrentUser } from 'common.services';
import { useYjsContext } from '../../../providers/YjsProvider';
import { useFollowUserStore } from '../../../store';

const AVATAR_API_BASE = 'https://api.sovlium.ru/files/users';
const MAX_VISIBLE_AVATARS = 3;

export const CollaboratorAvatars = () => {
  const { store, myPresenceId, status } = useYjsContext();
  const { followingPresenceId, setFollowingPresenceId } = useFollowUserStore();
  const { data: currentUser } = useCurrentUser();
  const [allPresences, setAllPresences] = useState<TLInstancePresence[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

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

  const myAvatarUrl =
    currentUser?.id != null ? `${AVATAR_API_BASE}/${currentUser.id}/avatar.webp` : undefined;

  const sortedPresences = useMemo(() => {
    return [...allPresences].sort((a, b) => {
      if (a.id === followingPresenceId) return -1;
      if (b.id === followingPresenceId) return 1;
      return 0;
    });
  }, [allPresences, followingPresenceId]);

  if (allPresences.length === 0 && !followingPresenceId) return null;

  const visiblePresences = sortedPresences.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = Math.max(0, sortedPresences.length - MAX_VISIBLE_AVATARS);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="cursor-pointer border-none bg-transparent p-0">
          <AvatarGroup>
            {visiblePresences.map((presence) => {
              const isMe = presence.id === myPresenceId;
              const isFollowed = followingPresenceId === presence.id;
              const name = presence.userName || 'Участник';
              const initial = name.charAt(0).toUpperCase();
              const avatarUrl = isMe ? myAvatarUrl : getAvatarUrlFromPresence(presence);

              return (
                <Avatar key={presence.id} size="s">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={isMe ? 'Вы' : name} size="s" />}
                  <AvatarFallback size="s">{initial}</AvatarFallback>
                  {isFollowed && (
                    <AvatarBadge
                      align="start"
                      className="bg-brand-80 dark:bg-brand-60"
                      title="Отслеживается"
                      aria-hidden
                    />
                  )}
                </Avatar>
              );
            })}
            {overflowCount > 0 && <AvatarGroupCount>+{overflowCount}</AvatarGroupCount>}
          </AvatarGroup>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" sideOffset={8} className="w-64 p-2">
        <div className="flex flex-col gap-1">
          <p className="text-gray-60 px-2 py-1 text-xs">Участники на доске</p>
          {sortedPresences.map((presence) => {
            const isMe = presence.id === myPresenceId;
            const isFollowed = followingPresenceId === presence.id;
            const name = presence.userName || 'Участник';
            const initial = name.charAt(0).toUpperCase();
            const avatarUrl = isMe ? myAvatarUrl : getAvatarUrlFromPresence(presence);

            return (
              <div
                key={presence.id}
                className="hover:bg-gray-5 flex items-center gap-2 rounded-lg px-2 py-1.5"
              >
                <Avatar size="s">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={isMe ? 'Вы' : name} size="s" />}
                  <AvatarFallback size="s">{initial}</AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-sm text-gray-100">{isMe ? 'Вы' : name}</span>
                {!isMe && (
                  <button
                    type="button"
                    className={cn(
                      'group flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors',
                      isFollowed ? 'bg-brand-0' : 'hover:bg-gray-5',
                    )}
                    onClick={() => setFollowingPresenceId(isFollowed ? null : presence.id)}
                    title={isFollowed ? 'Прекратить отслеживание' : `Следить за ${name}`}
                    data-umami-event="board-follow-user"
                    data-umami-event-state={isFollowed ? 'stop' : 'start'}
                  >
                    {isFollowed ? (
                      <Eyeon className="fill-brand-80 size-4 shrink-0" />
                    ) : (
                      <Eyeoff className="fill-gray-40 group-hover:fill-gray-80 size-4 shrink-0" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

function getAvatarUrlFromPresence(presence: TLInstancePresence): string | undefined {
  const meta = presence.meta as Record<string, unknown> | undefined;
  if (!meta || typeof meta !== 'object') return undefined;
  const id = meta.backendUserId;
  if (id == null) return undefined;
  const idStr = typeof id === 'number' ? String(id) : typeof id === 'string' ? id : undefined;
  if (!idStr) return undefined;
  return `${AVATAR_API_BASE}/${idStr}/avatar.webp`;
}
