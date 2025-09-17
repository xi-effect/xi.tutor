import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type PermissionState = undefined | 'granted' | 'prompt' | 'denied' | 'unavailable';

type BaseState = {
  cameraPermission: PermissionState;
  microphonePermission: PermissionState;
  isLoading: boolean;
  isPermissionDialogOpen: boolean;
};

type DerivedState = {
  isCameraGranted: boolean;
  isMicrophoneGranted: boolean;
  isCameraDenied: boolean;
  isMicrophoneDenied: boolean;
  isCameraPrompted: boolean;
  isMicrophonePrompted: boolean;
};

type State = BaseState & DerivedState;

export const usePermissionsStore = create<State>()(
  persist(
    (_, get) => ({
      cameraPermission: undefined,
      microphonePermission: undefined,
      isLoading: true,
      isPermissionDialogOpen: false,

      get isCameraGranted() {
        return get().cameraPermission === 'granted';
      },
      get isMicrophoneGranted() {
        return get().microphonePermission === 'granted';
      },
      get isCameraDenied() {
        return get().cameraPermission === 'denied';
      },
      get isMicrophoneDenied() {
        return get().microphonePermission === 'denied';
      },
      get isCameraPrompted() {
        return get().cameraPermission === 'prompt';
      },
      get isMicrophonePrompted() {
        return get().microphonePermission === 'prompt';
      },
    }),
    {
      name: 'permissions-storage',
      partialize: (state) => ({
        cameraPermission: state.cameraPermission,
        microphonePermission: state.microphonePermission,
      }),
    },
  ),
);

export const openPermissionsDialog = () => {
  usePermissionsStore.setState({ isPermissionDialogOpen: true });
};

export const closePermissionsDialog = () => {
  usePermissionsStore.setState({ isPermissionDialogOpen: false });
};
