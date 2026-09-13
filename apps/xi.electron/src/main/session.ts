import { session, type Session } from 'electron';
import { PARTITION } from '../shared/constants';
import { isBundledWebMode } from './config';
import { createAppOriginHandler } from './protocol';
import { resolveWebBundle } from './web-bundle';
import { installPermissionHandlers } from './permissions';

let cached: Session | null = null;

export function getSovliumSession(): Session {
  if (cached) return cached;
  cached = session.fromPartition(PARTITION);
  return cached;
}

export function configureSovliumSession(): Session {
  const ses = getSovliumSession();
  installPermissionHandlers(ses);

  if (isBundledWebMode()) {
    const bundle = resolveWebBundle();
    ses.protocol.handle('https', createAppOriginHandler(ses, bundle));
  }

  return ses;
}
