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
    const filteredSearch = search.call ? { call: search.call } : {};
    navigate({
      // @ts-ignore
      search: {
        // @ts-ignore
        tab: normalizeMaterialTabs && value === 'materials' ? 'boards' : value,
        ...filteredSearch,
      },
    });
  };

  return { isMobile, currentTab, handleTabChange };
};
