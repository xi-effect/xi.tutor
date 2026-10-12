import { useSyncExternalStore } from 'react';
import { getAppTimeZone, getAppTimeZoneRevision, subscribeAppTimeZone } from 'common.utils';

export const useAppTimeZone = (): string => {
  useSyncExternalStore(subscribeAppTimeZone, getAppTimeZoneRevision, getAppTimeZoneRevision);
  return getAppTimeZone();
};
