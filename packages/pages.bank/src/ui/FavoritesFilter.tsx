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
        'border-border-control bg-background-surface hover:bg-background-page',
        'box-border flex h-[33px] w-[33px] shrink-0 cursor-pointer items-center justify-center rounded-full border p-0',
        'outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        selected && 'bg-status-info-background border-border-focus',
      )}
      onClick={() => onChange(!selected)}
      aria-label={t('filters.favorites')}
      aria-pressed={selected}
      data-umami-event="math-bank-favorites-filter"
    >
      <FavoriteHeart active={selected} className="size-4" />
    </button>
  );
};
