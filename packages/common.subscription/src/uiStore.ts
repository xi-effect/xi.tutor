import { create } from 'zustand';
import { SUBSCRIPTION_BILLING_ENABLED } from './config';
import type { SubscriptionFeatureId } from './features';

export type SubscriptionScreen = 'overview' | 'checkout' | 'result' | 'manage';

export type PaymentResultStatus = 'success' | 'processing' | 'error';

export type SubscriptionDialog = 'classroom' | 'storage' | 'proFeature' | null;

type SubscriptionUiState = {
  screen: SubscriptionScreen;
  paymentResult: PaymentResultStatus | null;
  dialog: SubscriptionDialog;
  settingsOpenRequested: boolean;
  setScreen: (screen: SubscriptionScreen) => void;
  openOverview: () => void;
  openCompare: (openSettings?: boolean) => void;
  openCheckout: () => void;
  openManage: () => void;
  setPaymentResult: (paymentResult: PaymentResultStatus | null) => void;
  openDialog: (dialog: Exclude<SubscriptionDialog, null>) => void;
  closeDialog: () => void;
  requestSettingsOpen: () => void;
  consumeSettingsOpenRequest: () => void;
};

export const useSubscriptionUiStore = create<SubscriptionUiState>((set) => ({
  screen: 'overview',
  paymentResult: null,
  dialog: null,
  settingsOpenRequested: false,
  setScreen: (screen) => set({ screen }),
  openOverview: () => set({ screen: 'overview', paymentResult: null }),
  openCompare: (openSettings = true) =>
    set({
      screen: 'overview',
      dialog: null,
      paymentResult: null,
      settingsOpenRequested: openSettings,
    }),
  openCheckout: () => {
    if (!SUBSCRIPTION_BILLING_ENABLED) {
      set({ screen: 'overview', paymentResult: null });
      return;
    }
    set({
      screen: 'checkout',
      paymentResult: null,
    });
  },
  openManage: () => {
    if (!SUBSCRIPTION_BILLING_ENABLED) {
      set({ screen: 'overview', paymentResult: null });
      return;
    }
    set({ screen: 'manage', paymentResult: null });
  },
  setPaymentResult: (paymentResult) => {
    if (!SUBSCRIPTION_BILLING_ENABLED) return;
    set({ paymentResult, screen: 'result' });
  },
  openDialog: (dialog) => {
    if (!SUBSCRIPTION_BILLING_ENABLED) return;
    set({ dialog });
  },
  closeDialog: () => set({ dialog: null }),
  requestSettingsOpen: () => set({ settingsOpenRequested: true }),
  consumeSettingsOpenRequest: () => set({ settingsOpenRequested: false }),
}));

export const requestClassroomLimitDialog = () =>
  useSubscriptionUiStore.getState().openDialog('classroom');

export const requestStorageLimitDialog = () =>
  useSubscriptionUiStore.getState().openDialog('storage');

export const requestProFeatureDialog = (featureId?: SubscriptionFeatureId) => {
  void featureId;
  useSubscriptionUiStore.getState().openDialog('proFeature');
};
