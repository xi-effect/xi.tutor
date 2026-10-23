import { create } from 'zustand';
import { SUBSCRIPTION_BILLING_ENABLED } from './config';
import { isCurrentUserTutor } from './planCache';
import type { SubscriptionFeatureId } from './features';

export type SubscriptionScreen = 'overview' | 'checkout' | 'manage';

export type CheckoutReturnScreen = 'overview' | 'manage';

export type SubscriptionDialog = 'classroom' | 'storage' | 'proFeature' | 'imageUpgrade' | null;

type SubscriptionUiState = {
  screen: SubscriptionScreen;
  checkoutReturnTo: CheckoutReturnScreen;
  dialog: SubscriptionDialog;
  settingsOpenRequested: boolean;
  openOverview: () => void;
  openCompare: (openSettings?: boolean) => void;
  openCheckout: (returnTo?: CheckoutReturnScreen) => void;
  closeCheckout: () => void;
  openManage: () => void;
  openDialog: (dialog: Exclude<SubscriptionDialog, null>) => void;
  closeDialog: () => void;
  requestSettingsOpen: () => void;
  consumeSettingsOpenRequest: () => void;
  reset: () => void;
};

const initialState = {
  screen: 'overview' as SubscriptionScreen,
  checkoutReturnTo: 'overview' as CheckoutReturnScreen,
  dialog: null as SubscriptionDialog,
  settingsOpenRequested: false,
};

export const useSubscriptionUiStore = create<SubscriptionUiState>((set, get) => ({
  ...initialState,
  openOverview: () => set({ screen: 'overview' }),
  openCompare: (openSettings = true) =>
    set({
      screen: 'overview',
      dialog: null,
      settingsOpenRequested: openSettings,
    }),
  openCheckout: (returnTo) => {
    if (!SUBSCRIPTION_BILLING_ENABLED) {
      set({ screen: 'overview' });
      return;
    }
    set({ screen: 'checkout', checkoutReturnTo: returnTo === 'manage' ? 'manage' : 'overview' });
  },
  closeCheckout: () => set({ screen: get().checkoutReturnTo, checkoutReturnTo: 'overview' }),
  openManage: () => {
    if (!SUBSCRIPTION_BILLING_ENABLED) {
      set({ screen: 'overview' });
      return;
    }
    set({ screen: 'manage' });
  },
  openDialog: (dialog) => {
    if (!SUBSCRIPTION_BILLING_ENABLED || !isCurrentUserTutor()) return;
    set({ dialog });
  },
  closeDialog: () => set({ dialog: null }),
  requestSettingsOpen: () => set({ settingsOpenRequested: true }),
  consumeSettingsOpenRequest: () => set({ settingsOpenRequested: false }),
  reset: () => set(initialState),
}));

export const requestClassroomLimitDialog = () =>
  useSubscriptionUiStore.getState().openDialog('classroom');

export const requestStorageLimitDialog = () =>
  useSubscriptionUiStore.getState().openDialog('storage');

export const requestImageUpgradeDialog = () =>
  useSubscriptionUiStore.getState().openDialog('imageUpgrade');

export const requestProFeatureDialog = (featureId?: SubscriptionFeatureId) => {
  void featureId;
  useSubscriptionUiStore.getState().openDialog('proFeature');
};
