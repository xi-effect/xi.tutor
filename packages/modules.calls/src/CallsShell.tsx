import { ReactNode, useEffect, useMemo } from 'react';
import {
  CallsNavigationProvider,
  CallsSessionProvider,
  CallsProvider,
  CallsRuntimeConfigProvider,
  useCallsRuntimeConfig,
  RoomProvider,
  LiveKitProvider,
} from '@xipkg/calls-providers';
import { ModeSyncProvider } from '@xipkg/calls-hooks';
import { useCallStore, useFeaturesStore } from '@xipkg/calls-store';
import { useTanstackCallsNavigation } from './useTanstackCallsNavigation';
import { callsSessionPort } from './callsSession';
import { createCallsRuntimeConfig } from './createCallsRuntimeConfig';
import { useCallsDeps } from './useCallsDeps';

import '@xipkg/calls-ui/video-security.css';
import '@xipkg/calls-ui/driver.css';
import '@xipkg/calls-ui/grid.css';

type CallsShellPropsT = {
  children: ReactNode;
};

const CallsShellInit = () => {
  const navigation = useTanstackCallsNavigation();
  const {
    liveKit: { isDevMode, devToken },
  } = useCallsRuntimeConfig();

  useEffect(() => {
    useFeaturesStore.getState().setFeatures({
      chat: true,
      raiseHand: true,
      whiteboard: true,
    });
  }, []);

  useEffect(() => {
    if (!isDevMode || !devToken) return;

    const { updateStore } = useCallStore.getState();
    updateStore('token', devToken);

    const callId = navigation.getCallId();
    if (callId) {
      updateStore('activeClassroom', callId);
    }
  }, [navigation, isDevMode, devToken]);

  return null;
};

const CallsShellProviders = ({ children }: CallsShellPropsT) => {
  const deps = useCallsDeps();

  return (
    <CallsProvider deps={deps}>
      <RoomProvider>
        <LiveKitProvider>
          <ModeSyncProvider>
            <CallsShellInit />
            {children}
          </ModeSyncProvider>
        </LiveKitProvider>
      </RoomProvider>
    </CallsProvider>
  );
};

export const CallsShell = ({ children }: CallsShellPropsT) => {
  const runtimeConfig = useMemo(() => createCallsRuntimeConfig(), []);

  return (
    <CallsRuntimeConfigProvider config={runtimeConfig}>
      <CallsNavigationProvider useNavigation={useTanstackCallsNavigation}>
        <CallsSessionProvider session={callsSessionPort}>
          <CallsShellProviders>{children}</CallsShellProviders>
        </CallsSessionProvider>
      </CallsNavigationProvider>
    </CallsRuntimeConfigProvider>
  );
};
