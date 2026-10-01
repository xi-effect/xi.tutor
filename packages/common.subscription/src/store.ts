import { create } from 'zustand';

export type SubscriptionMock = {
  boardAtLimit: boolean;
  forceOversizedFile: boolean;
};

export type SubscriptionState = {
  mock: SubscriptionMock;
  patchMock: (patch: Partial<SubscriptionMock>) => void;
};

const defaultMock: SubscriptionMock = {
  boardAtLimit: false,
  forceOversizedFile: false,
};

export const useSubscriptionStore = create<SubscriptionState>()((set) => ({
  mock: defaultMock,
  patchMock: (patch) => set((state) => ({ mock: { ...state.mock, ...patch } })),
}));

if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('sovlium-subscription-mock');
}
