import { useMemo } from 'react';
import { useParams, useSearch } from '@tanstack/react-router';
import { useCallStore } from 'modules.calls';
import { pickSettingsSearch, type SettingsSearch } from 'modules.profile/sections';

export const useSettingsSearch = (): SettingsSearch => {
  const search = useSearch({ strict: false });
  const { callId } = useParams({ strict: false });
  const isStarted = useCallStore((state) => state.isStarted);
  const mode = useCallStore((state) => state.mode);
  const callFromRoute =
    isStarted && mode === 'full' && typeof callId === 'string' ? callId : undefined;

  return useMemo(() => pickSettingsSearch(search, callFromRoute), [search, callFromRoute]);
};
