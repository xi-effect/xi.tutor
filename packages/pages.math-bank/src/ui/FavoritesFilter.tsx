import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { FavoriteHeart } from './FavoriteHeart';

type FavoritesFilterProps = {
  selected: boolean;
  onChange: (selected: boolean) => void;
};

export const FavoritesFilter = ({ selected, onChange }: FavoritesFilterProps) => {
  const { t } = useTranslation('mathBank');

  return (
    <button
      type="button"
      className={cn(
        'box-border flex h-[33px] w-fit max-w-full shrink-0 cursor-pointer items-center gap-2 rounded-full border py-2 pr-3 pl-4',
        'text-s-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        selected
          ? 'bg-status-info-background border-border-focus text-text-primary'
          : 'bg-background-surface border-border-control text-text-primary hover:bg-background-page',
      )}
      onClick={() => onChange(!selected)}
      data-umami-event="math-bank-favorites-filter"
    >
      <FavoriteHeart active={selected} className="size-4" />
      <span className="whitespace-nowrap">{t('filters.favorites')}</span>
    </button>
  );
};
