import { useTranslation } from 'react-i18next';
import { MaterialsListSkeleton } from '../../Overview/MaterialsListSkeleton';
import { MaterialHeader } from './MaterialHeader';
import { WidgetCardsCarousel, widgetCardSlotClass } from '../../WidgetCardsCarousel';
import { galleryShadowHeaderInsetClass } from '../../galleryShadowClass';

export const LoadingState = () => {
  const { t } = useTranslation('classroom');

  return (
    <div className="flex flex-col gap-8 pt-2">
      <div className="flex flex-col gap-4">
        <div className={galleryShadowHeaderInsetClass}>
          <MaterialHeader title={t('materials.boards')} />
        </div>
        <WidgetCardsCarousel>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={widgetCardSlotClass}>
              <MaterialsListSkeleton className="h-40 w-full" />
            </div>
          ))}
        </WidgetCardsCarousel>
      </div>
      <div className="flex flex-col gap-4">
        <div className={galleryShadowHeaderInsetClass}>
          <MaterialHeader title={t('materials.notes')} />
        </div>
        <WidgetCardsCarousel>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={widgetCardSlotClass}>
              <MaterialsListSkeleton className="h-40 w-full" />
            </div>
          ))}
        </WidgetCardsCarousel>
      </div>
    </div>
  );
};
