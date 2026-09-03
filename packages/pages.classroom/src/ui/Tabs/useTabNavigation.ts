/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useLayoutEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useMedia } from 'common.utils';
import { SearchParams } from '../../types/router';

export const DEFAULT_CLASSROOM_TAB = 'boards';

const LEGACY_CLASSROOM_TABS = new Set(['overview', 'materials']);

export const isClassroomMaterialTab = (tab: string) =>
  tab === 'boards' || tab === 'notes' || tab === 'files';

export const resolveClassroomTab = (tab: string | undefined): string => {
  if (!tab || LEGACY_CLASSROOM_TABS.has(tab)) return DEFAULT_CLASSROOM_TAB;
  return tab;
};

export const useTabNavigation = () => {
  const isMobile = useMedia('(max-width: 960px)');
  const search: SearchParams = useSearch({ strict: false });
  const navigate = useNavigate();

  const currentTab = resolveClassroomTab(search.tab);

  useLayoutEffect(() => {
    const raw = search.tab;
    if (raw && !LEGACY_CLASSROOM_TABS.has(raw)) return;

    navigate({
      // @ts-ignore
      search: (prev) => {
        const prevSearch = prev as SearchParams;
        if (prevSearch.tab === DEFAULT_CLASSROOM_TAB) return prevSearch;
        return {
          ...prevSearch,
          tab: DEFAULT_CLASSROOM_TAB,
        };
      },
      replace: true,
    });
  }, [navigate, search.tab]);

  const handleTabChange = (value: string) => {
    navigate({
      // @ts-ignore
      search: (prev) => {
        const prevSearch = prev as SearchParams;
        const next: SearchParams = {
          ...prevSearch,
          tab: value,
        };

        if (value !== 'schedule') {
          delete next.event_instance_id;
          delete next.focused_at;
          delete next.repetition_mode_id;
          delete next.instance_index;
          delete next.schedule_dl;
        }

        return next;
      },
    });
  };

  return { isMobile, currentTab, handleTabChange };
};
