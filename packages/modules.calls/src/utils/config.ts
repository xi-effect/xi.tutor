import { env } from 'common.env';

export const serverUrl = env.VITE_SERVER_URL_LIVEKIT;
export const serverUrlDev = env.VITE_SERVER_URL_LIVEKIT_DEV;
export const devToken = env.VITE_LIVEKIT_DEV_TOKEN;
export const isDevMode = env.VITE_LIVEKIT_DEV_MODE;
