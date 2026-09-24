import { trackMathTaskFavoriteToggle, type MathBankAnalyticsSource } from 'common.utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useMathBankUserStore } from '../store/useMathBankUserStore';

export const useToggleMathBankFavorite = (source: MathBankAnalyticsSource = 'page') => {
  const { t } = useTranslation('mathBank');
  const toggleFavorite = useMathBankUserStore((state) => state.toggleFavorite);
  const isFavorite = useMathBankUserStore((state) => state.isFavorite);

  return (taskId: string) => {
    const action = isFavorite(taskId) ? 'remove' : 'add';
    const isFirstFavorite = toggleFavorite(taskId);
    trackMathTaskFavoriteToggle(taskId, action, source);
    if (isFirstFavorite) {
      toast(t('favorites.storedOnDevice'));
    }
  };
};
