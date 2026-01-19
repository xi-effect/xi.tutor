import { parseEnv } from './utils';

// Парсеры
const asBoolean = (value: string | null, defaultValue?: boolean): boolean =>
  parseEnv(value, (v) => v === 'true', defaultValue);

// const asNumber = (value: string | null, defaultValue?: number): number =>
//   parseEnv(value, (v) => {
//     const num = Number(v);
//     if (isNaN(num)) throw new Error(`Invalid number: ${v}`);
//     return num;
//   }, defaultValue);

const asString = (value: string | null, defaultValue?: string): string =>
  parseEnv(value, (v) => v, defaultValue);

const env = {
  DEV: import.meta.env.MODE === 'development',

  VITE_SERVER_URL_BACKEND: asString(
    import.meta.env.VITE_SERVER_URL_BACKEND,
    'https://api.sovlium.ru',
  ),
  VITE_SERVER_URL_SOCKETIO: asString(
    import.meta.env.VITE_SERVER_URL_SOCKETIO,
    import.meta.env.VITE_SERVER_URL_BACKEND || 'https://api.sovlium.ru',
  ),
  VITE_SERVER_URL_LIVEKIT: asString(
    import.meta.env.VITE_SERVER_URL_LIVEKIT,
    'https://livekit.sovlium.ru',
  ),
  VITE_SERVER_URL_LIVEKIT_DEV: asString(
    import.meta.env.VITE_SERVER_URL_LIVEKIT_DEV,
    'ws://127.0.0.1:7880',
  ),
  VITE_LIVEKIT_DEV_TOKEN: asString(import.meta.env.VITE_LIVEKIT_DEV_TOKEN, ''),
  VITE_LIVEKIT_DEV_MODE: asBoolean(import.meta.env.VITE_LIVEKIT_DEV_MODE, false),
  VITE_SERVER_URL_HOCUS: asString(
    import.meta.env.VITE_SERVER_URL_HOCUS,
    'https://hocus.sovlium.ru',
  ),
  VITE_APP_DOMAIN: asString(import.meta.env.VITE_APP_DOMAIN, 'https://app.sovlium.ru'),
  VITE_DEVTOOLS_ENABLED: asBoolean(import.meta.env.VITE_REACT_QUERY_DEVTOOLS_ENABLED, false),
  VITE_ENABLE_X_TESTING: asBoolean(import.meta.env.VITE_ENABLE_X_TESTING, false),
  VITE_ENABLE_PERFORMANCE_PROFILING: asBoolean(
    import.meta.env.VITE_ENABLE_PERFORMANCE_PROFILING,
    false,
  ),
  VITE_GLITCHTIP_DSN: asString(import.meta.env.VITE_GLITCHTIP_DSN, ''),
};

console.log('env', env);

const checkEnv = (envKey: keyof typeof env): boolean => {
  if (envKey in env) return true;
  console.error(`%c• ${envKey} isn't defined`, 'color: red');
  return false;
};

export { checkEnv, env };
