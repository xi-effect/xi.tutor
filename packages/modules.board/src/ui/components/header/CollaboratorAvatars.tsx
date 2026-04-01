import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@xipkg/avatar';
import { Button } from '@xipkg/button';
import { Eyeon, Podcast } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TLInstancePresence } from 'tldraw';
import { useCurrentUser } from 'common.services';
import { useYjsContext } from '../../../providers/YjsProvider';
import { useFollowUserStore } from '../../../store';

const AVATAR_API_BASE = 'https://api.sovlium.ru/files/users';
const MAX_VISIBLE_AVATARS = 3;
const MAX_VISIBLE_AVATARS_BROADCASTING = 1;

export const CollaboratorAvatars = () => {
  const { store, myPresenceId, status, provider } = useYjsContext();
  const {
    followingPresenceId,
    setFollowingPresenceId,
    isBroadcasting,
    setIsBroadcasting,
    broadcasterPresenceId,
    setBroadcasterPresenceId,
  } = useFollowUserStore();
  const { data: currentUser } = useCurrentUser();
  const isTutor = currentUser?.default_layout === 'tutor';
  const [allPresences, setAllPresences] = useState<TLInstancePresence[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const followingRef = useRef(followingPresenceId);
  followingRef.current = followingPresenceId;
  const prevBroadcasterRef = useRef<string | null>(null);

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

  // Detect broadcast presenter via awareness
  useEffect(() => {
    const awareness = provider.awareness;
    if (!awareness || status !== 'synced-remote') return;

    const detectBroadcaster = () => {
      const states = awareness.getStates() as Map<number, Record<string, unknown>>;
      let foundPresenceId: string | null = null;

      for (const [, state] of states) {
        if (state?.broadcastFollow === true) {
          const presence = state.presence as TLInstancePresence | undefined;
          if (presence?.id) {
            foundPresenceId = presence.id;
            break;
          }
        }
      }

      const prev = prevBroadcasterRef.current;
      prevBroadcasterRef.current = foundPresenceId;
      setBroadcasterPresenceId(foundPresenceId);

      if (foundPresenceId && foundPresenceId !== myPresenceId) {
        setFollowingPresenceId(foundPresenceId);
      } else if (!foundPresenceId && prev && prev !== myPresenceId) {
        if (followingRef.current === prev) {
          setFollowingPresenceId(null);
        }
      }
    };

    detectBroadcaster();
    awareness.on('change', detectBroadcaster);
    return () => awareness.off('change', detectBroadcaster);
  }, [provider, status, myPresenceId, setFollowingPresenceId, setBroadcasterPresenceId]);

  // Re-enforce follow during active broadcast (prevents manual unfollow by students)
  useEffect(() => {
    if (
      broadcasterPresenceId &&
      broadcasterPresenceId !== myPresenceId &&
      followingPresenceId !== broadcasterPresenceId
    ) {
      setFollowingPresenceId(broadcasterPresenceId);
    }
  }, [followingPresenceId, broadcasterPresenceId, myPresenceId, setFollowingPresenceId]);

  // Auto-stop follow when followed user leaves
  useEffect(() => {
    if (!followingPresenceId || allPresences.length === 0) return;
    const deduped = dedupeInstancePresences(allPresences, myPresenceId, followingPresenceId);
    const stillOnBoard = deduped.some((p) => p.id === followingPresenceId);
    if (!stillOnBoard) {
      setFollowingPresenceId(null);
    }
  }, [allPresences, followingPresenceId, myPresenceId, setFollowingPresenceId]);

  // Cleanup broadcast on unmount
  useEffect(() => {
    const awareness = provider.awareness;
    return () => {
      if (useFollowUserStore.getState().isBroadcasting && awareness) {
        awareness.setLocalStateField('broadcastFollow', false);
      }
      setIsBroadcasting(false);
      setBroadcasterPresenceId(null);
    };
  }, [provider, setIsBroadcasting, setBroadcasterPresenceId]);

  const toggleBroadcast = useCallback(() => {
    const awareness = provider.awareness;
    if (!awareness) return;
    const next = !isBroadcasting;
    awareness.setLocalStateField('broadcastFollow', next);
    setIsBroadcasting(next);
  }, [provider, isBroadcasting, setIsBroadcasting]);

  const myAvatarUrl =
    currentUser?.id != null ? `${AVATAR_API_BASE}/${currentUser.id}/avatar.webp` : undefined;

  const sortedPresences = useMemo(() => {
    const deduped = dedupeInstancePresences(allPresences, myPresenceId, followingPresenceId);
    return [...deduped].sort((a, b) => {
      if (a.id === followingPresenceId) return -1;
      if (b.id === followingPresenceId) return 1;
      return 0;
    });
  }, [allPresences, followingPresenceId, myPresenceId]);

  if (sortedPresences.length === 0 && !followingPresenceId) return null;

  const maxAvatars = isBroadcasting ? MAX_VISIBLE_AVATARS_BROADCASTING : MAX_VISIBLE_AVATARS;
  const visiblePresences = sortedPresences.slice(0, maxAvatars);
  const overflowCount = Math.max(0, sortedPresences.length - maxAvatars);
  const isBroadcastActive = !!broadcasterPresenceId;

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <div className="flex items-center gap-1">
        {isBroadcasting && (
          <button
            type="button"
            className="bg-brand-0 hover:bg-brand-20/40 pointer-events-auto flex h-6 w-6 items-center justify-center rounded-full transition-colors lg:h-7 lg:w-7"
            onClick={toggleBroadcast}
            title="Выключить режим презентации"
            data-umami-event="board-broadcast-follow"
            data-umami-event-state="stop"
          >
            <Podcast className="text-brand-80 size-4 shrink-0" />
          </button>
        )}
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
      </div>
      <PopoverContent align="end" side="bottom" sideOffset={8} className="w-64 p-2">
        <div className="flex flex-col gap-1">
          {isTutor && (
            <Button
              variant="ghost"
              size="s"
              className={cn(
                'flex w-full items-center justify-start gap-2',
                isBroadcasting && 'bg-brand-0 text-brand-80 hover:bg-brand-0/80',
              )}
              onClick={toggleBroadcast}
              data-umami-event="board-broadcast-follow"
              data-umami-event-state={isBroadcasting ? 'stop' : 'start'}
            >
              <Podcast
                className={cn('size-4 shrink-0', isBroadcasting ? 'text-brand-80' : 'text-gray-80')}
              />
              {isBroadcasting ? 'Выключить презентацию' : 'Режим презентации'}
            </Button>
          )}
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
                      isBroadcastActive && 'pointer-events-none opacity-40',
                    )}
                    onClick={() => setFollowingPresenceId(isFollowed ? null : presence.id)}
                    title={isFollowed ? 'Прекратить отслеживание' : `Следить за ${name}`}
                    disabled={isBroadcastActive}
                    data-umami-event="board-follow-user"
                    data-umami-event-state={isFollowed ? 'stop' : 'start'}
                  >
                    {isFollowed ? (
                      <Eyeon className="fill-brand-80 size-4 shrink-0" />
                    ) : (
                      <Eyeon className="fill-gray-40 group-hover:fill-gray-80 size-4 shrink-0" />
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

/**
 * В Y.Doc могут остаться несколько instance_presence с одним backendUserId (реконнекты / повторный synced).
 * В UI показываем одну карточку на реального пользователя.
 */
function dedupeInstancePresences(
  presences: TLInstancePresence[],
  myPresenceId: string | null,
  followingPresenceId: string | null,
): TLInstancePresence[] {
  const groups = new Map<string, TLInstancePresence[]>();
  const withoutBackend: TLInstancePresence[] = [];

  for (const p of presences) {
    const bid = getBackendUserIdString(p);
    if (bid == null) {
      withoutBackend.push(p);
      continue;
    }
    const list = groups.get(bid);
    if (list) list.push(p);
    else groups.set(bid, [p]);
  }

  const merged: TLInstancePresence[] = [];

  for (const group of groups.values()) {
    if (group.length === 1) {
      merged.push(group[0]);
      continue;
    }
    merged.push(pickBestPresenceDuplicate(group, myPresenceId, followingPresenceId));
  }

  return [...merged, ...withoutBackend];
}

function pickBestPresenceDuplicate(
  group: TLInstancePresence[],
  myPresenceId: string | null,
  followingPresenceId: string | null,
): TLInstancePresence {
  const sorted = [...group].sort((a, b) => {
    if (followingPresenceId) {
      if (a.id === followingPresenceId) return -1;
      if (b.id === followingPresenceId) return 1;
    }
    if (myPresenceId) {
      if (a.id === myPresenceId) return -1;
      if (b.id === myPresenceId) return 1;
    }
    const ta = a.lastActivityTimestamp ?? 0;
    const tb = b.lastActivityTimestamp ?? 0;
    return tb - ta;
  });
  return sorted[0];
}

function getBackendUserIdString(presence: TLInstancePresence): string | undefined {
  const meta = presence.meta as Record<string, unknown> | undefined;
  if (!meta || typeof meta !== 'object') return undefined;
  const id = meta.backendUserId;
  if (id == null) return undefined;
  return typeof id === 'number' ? String(id) : typeof id === 'string' ? id : undefined;
}

function getAvatarUrlFromPresence(presence: TLInstancePresence): string | undefined {
  const idStr = getBackendUserIdString(presence);
  if (!idStr) return undefined;
  return `${AVATAR_API_BASE}/${idStr}/avatar.webp`;
}
