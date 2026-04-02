import { create } from 'zustand';

interface FollowUserState {
  followingPresenceId: string | null;
  setFollowingPresenceId: (id: string | null) => void;
  /** Репетитор включил режим презентации (локальное состояние текущего пользователя) */
  isBroadcasting: boolean;
  setIsBroadcasting: (value: boolean) => void;
  /** Presence ID пользователя, ведущего презентацию (определяется из awareness; null — никто не ведёт) */
  broadcasterPresenceId: string | null;
  setBroadcasterPresenceId: (id: string | null) => void;
}

export const useFollowUserStore = create<FollowUserState>((set) => ({
  followingPresenceId: null,
  setFollowingPresenceId: (id) => set({ followingPresenceId: id }),
  isBroadcasting: false,
  setIsBroadcasting: (value) => set({ isBroadcasting: value }),
  broadcasterPresenceId: null,
  setBroadcasterPresenceId: (id) => set({ broadcasterPresenceId: id }),
}));
