/**
 * Thin React shell for the Tauri host.
 *
 * We deliberately reuse `AppProviders` from `xi.web` rather than duplicating
 * router / auth / theme wiring. The only difference between the web app and the
 * Tauri shell at the React layer should be additive (e.g. an UpdateBanner that
 * only renders on desktop).
 */

import { AppProviders } from 'web/providers';

export const App = () => {
  return <AppProviders />;
};
