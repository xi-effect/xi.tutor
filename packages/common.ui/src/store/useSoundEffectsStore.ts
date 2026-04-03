import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SoundKey = 'chatMessage' | 'handRaise' | 'boardTimerEnd' | 'boardTimerWarn';

interface SoundEffectsState {
  chatMessageVolume: number;
  handRaiseVolume: number;
  boardTimerEndVolume: number;
  boardTimerWarnVolume: number;

  setSoundVolume: (key: SoundKey, volume: number) => void;
  getEffectiveVolume: (key: SoundKey) => number;
}

const DEFAULTS: Record<SoundKey, number> = {
  chatMessage: 0.25,
  handRaise: 0.25,
  boardTimerEnd: 1,
  boardTimerWarn: 1,
};

const VOLUME_KEY_MAP: Record<SoundKey, keyof SoundEffectsState> = {
  chatMessage: 'chatMessageVolume',
  handRaise: 'handRaiseVolume',
  boardTimerEnd: 'boardTimerEndVolume',
  boardTimerWarn: 'boardTimerWarnVolume',
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const useSoundEffectsStore = create<SoundEffectsState>()(
  persist(
    (set, get) => ({
      chatMessageVolume: DEFAULTS.chatMessage,
      handRaiseVolume: DEFAULTS.handRaise,
      boardTimerEndVolume: DEFAULTS.boardTimerEnd,
      boardTimerWarnVolume: DEFAULTS.boardTimerWarn,

      setSoundVolume: (key, volume) => {
        const min = key === 'boardTimerEnd' ? 0.2 : 0;
        const clamped = clamp(volume, min, 1);
        set({ [VOLUME_KEY_MAP[key]]: clamped });
      },

      getEffectiveVolume: (key) => {
        const storeKey = VOLUME_KEY_MAP[key];
        return get()[storeKey] as number;
      },
    }),
    {
      name: 'sound-effects-store',
      version: 1,
      partialize: (state) => ({
        chatMessageVolume: state.chatMessageVolume,
        handRaiseVolume: state.handRaiseVolume,
        boardTimerEndVolume: state.boardTimerEndVolume,
        boardTimerWarnVolume: state.boardTimerWarnVolume,
      }),
    },
  ),
);

export { DEFAULTS as SOUND_DEFAULTS };
export type { SoundKey };
