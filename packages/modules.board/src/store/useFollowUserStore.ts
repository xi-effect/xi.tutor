import { create } from 'zustand';

/**
 * Режим "следовать за пользователем": камера повторяет вид выбранного коллаборатора.
 * ID presence записи того пользователя, за которым следим, или null если режим выключен.
 */
interface FollowUserState {
  followingPresenceId: string | null;
  setFollowingPresenceId: (id: string | null) => void;
}

export const useFollowUserStore = create<FollowUserState>((set) => ({
  followingPresenceId: null,
  setFollowingPresenceId: (id) => set({ followingPresenceId: id }),
}));
