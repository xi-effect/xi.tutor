import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDaysFromLaterOf } from './period';
import { DEFAULT_PRO_RENEWS_AT, type PlanId } from './tariffs';

export type PaymentOutcome = 'success' | 'processing' | 'cancel' | 'error';

export type SubscriptionMock = {
  classroomsUsed: number;
  storageUsedBytes: number;
  boardAtLimit: boolean;
  forceOversizedFile: boolean;
  paymentOutcome: PaymentOutcome;
};

export type SubscriptionState = {
  planId: PlanId;
  autoRenew: boolean;
  renewsAt: string;
  mock: SubscriptionMock;
  setPlanId: (planId: PlanId) => void;
  setAutoRenew: (autoRenew: boolean) => void;
  setRenewsAt: (renewsAt: string) => void;
  patchMock: (patch: Partial<SubscriptionMock>) => void;
  activatePro: () => void;
  applyPromoDays: (days: number) => void;
  revertToBasic: () => void;
};

const defaultMock: SubscriptionMock = {
  classroomsUsed: 2,
  storageUsedBytes: 80 * 1024 * 1024,
  boardAtLimit: false,
  forceOversizedFile: false,
  paymentOutcome: 'success',
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      planId: 'basic',
      autoRenew: true,
      renewsAt: DEFAULT_PRO_RENEWS_AT,
      mock: defaultMock,
      setPlanId: (planId) =>
        set((state) => ({
          planId,
          autoRenew: planId === 'pro' ? state.autoRenew : true,
        })),
      setAutoRenew: (autoRenew) => set({ autoRenew }),
      setRenewsAt: (renewsAt) => set({ renewsAt }),
      patchMock: (patch) => set((state) => ({ mock: { ...state.mock, ...patch } })),
      activatePro: () =>
        set((state) => {
          const base =
            state.planId === 'pro'
              ? Math.max(Date.now(), new Date(state.renewsAt).getTime())
              : Date.now();
          const next = new Date(base);
          next.setMonth(next.getMonth() + 1);
          return {
            planId: 'pro',
            autoRenew: true,
            renewsAt: next.toISOString(),
          };
        }),
      applyPromoDays: (days) =>
        set((state) => ({
          planId: 'pro',
          autoRenew: state.planId === 'pro' ? state.autoRenew : false,
          renewsAt:
            state.planId === 'pro'
              ? addDaysFromLaterOf(state.renewsAt, days)
              : addDaysFromLaterOf(new Date().toISOString(), days),
        })),
      revertToBasic: () =>
        set({
          planId: 'basic',
          autoRenew: true,
        }),
    }),
    {
      name: 'sovlium-subscription-mock',
      partialize: (state) => ({
        planId: state.planId,
        autoRenew: state.autoRenew,
        renewsAt: state.renewsAt,
        mock: state.mock,
      }),
    },
  ),
);
