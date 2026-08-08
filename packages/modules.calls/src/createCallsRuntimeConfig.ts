import type { CallsRuntimeConfigT } from '@xipkg/calls-providers';
import { env } from 'common.env';

export const createCallsRuntimeConfig = (): CallsRuntimeConfigT => ({
  liveKit: {
    serverUrl: env.VITE_SERVER_URL_LIVEKIT,
    serverUrlDev: env.VITE_SERVER_URL_LIVEKIT_DEV,
    isDevMode: env.VITE_LIVEKIT_DEV_MODE,
    devToken: env.VITE_LIVEKIT_DEV_TOKEN,
  },
  noiseCancellation: {
    featureEnabled: env.VITE_NOISE_CANCELLATION_FEATURE_ENABLED,
    allowKrisp: env.VITE_ALLOW_KRISP_NOISE_CANCELLATION,
  },
});
