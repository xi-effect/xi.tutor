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

  VITE_SERVER_URL_BACKEND: asString(import.meta.env.VITE_SERVER_URL_BACKEND),
  VITE_SERVER_URL_AUTH: asString(import.meta.env.VITE_SERVER_URL_AUTH),
  VITE_SERVER_URL_LIVE: asString(import.meta.env.VITE_SERVER_URL_LIVE),
  VITE_DEVTOOLS_ENABLED: asBoolean(import.meta.env.VITE_REACT_QUERY_DEVTOOLS_ENABLED, false),
  VITE_ENABLE_X_TESTING: asBoolean(import.meta.env.VITE_ENABLE_X_TESTING, false),
};

const checkEnv = (envKey: keyof typeof env): boolean => {
  if (envKey in env) return true;
  console.error(`%c• ${envKey} isn't defined`, 'color: red');
  return false;
};

export { checkEnv, env };
