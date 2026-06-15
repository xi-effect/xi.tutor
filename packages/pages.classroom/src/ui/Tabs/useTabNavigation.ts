/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useMedia } from 'common.utils';
import { SearchParams } from '../../types/router';

interface UseTabNavigationOptions {
  /** Нормализовать tabs 'notes' и 'boards' в 'materials' (нужно для репетитора) */
  normalizeMaterialTabs?: boolean;
}

export const useTabNavigation = ({
  normalizeMaterialTabs = false,
}: UseTabNavigationOptions = {}) => {
  const isMobile = useMedia('(max-width: 720px)');
  const search: SearchParams = useSearch({ strict: false });
  const navigate = useNavigate();

  const currentTab = normalizeMaterialTabs
    ? search.tab === 'notes' || search.tab === 'boards'
      ? 'materials'
      : (search.tab ?? 'overview')
    : (search.tab ?? 'overview');

  const handleTabChange = (value: string) => {
    navigate({
      // @ts-ignore
      search: (prev) => {
        const prevSearch = prev as SearchParams;
        const nextTab = normalizeMaterialTabs && value === 'materials' ? 'boards' : value;
        const next: SearchParams = {
          ...prevSearch,
          tab: nextTab,
        };

        if (nextTab !== 'schedule') {
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
