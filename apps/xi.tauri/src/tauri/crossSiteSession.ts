/**
 * Temporary experiment: ask the backend for a cross-site session cookie
 * (`SameSite=None`) via the existing `X-Testing: true` hook in xi.back-2.
 *
 * ONLY for local native debugging. Do not ship enabled to end users — the
 * header is a test lever, not a production native-client contract.
 */

import { getAxiosInstance } from 'common.config';
import { tauriShellEnv } from '../env';

const CROSS_SITE_HEADER = 'X-Testing';
const CROSS_SITE_VALUE = 'true';

let installed = false;

export async function installCrossSiteSessionProbe(): Promise<void> {
  if (!tauriShellEnv.crossSiteSessionProbe || installed) return;
  installed = true;

  const axios = await getAxiosInstance();
  axios.interceptors.request.use((config) => {
    const headers = config.headers ?? {};
    headers[CROSS_SITE_HEADER] = CROSS_SITE_VALUE;
    config.headers = headers;
    return config;
  });

  console.info(
    '[xi.tauri] cross-site session probe enabled: sending',
    `${CROSS_SITE_HEADER}: ${CROSS_SITE_VALUE}`,
    'on API requests (SameSite=None sessions)',
  );
}
