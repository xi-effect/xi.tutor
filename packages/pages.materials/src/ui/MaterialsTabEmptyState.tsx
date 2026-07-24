import { Button } from '@xipkg/button';
import { ArrowUpRight } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { EmptyMaterialsFull } from 'common.ui';
import { useTranslation } from 'react-i18next';

/** База знаний — как на странице оплат */
const MATERIALS_HELP_URL = 'https://support.sovlium.ru/board-and-notes';

const emptyMaterialsHelpLinkClass =
  'bg-background-page hover:bg-background-subtle text-xs-base h-8 rounded-lg px-4 font-medium text-text-primary';

type MaterialsTabEmptyStateProps = {
  title: string;
  description: string;
};

/** Пустое состояние вкладки материалов (вёрстка как у списка оплат). */
export const MaterialsTabEmptyState = ({ title, description }: MaterialsTabEmptyStateProps) => {
  const { t } = useTranslation('materials');

  return (
    <div className="bg-background-surface box-border flex h-[calc(100dvh-120px)] w-full flex-col rounded-tl-2xl pt-2 pr-5 pb-4">
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-hidden',
          'px-6 py-10 sm:gap-10 sm:px-8 sm:py-12',
        )}
      >
        <div className="flex max-w-md flex-col gap-2 text-center">
          <p className="text-l-base text-text-primary font-semibold">{title}</p>
          <p className="text-s-base text-text-secondary dark:text-text-muted">{description}</p>
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="none"
              className={emptyMaterialsHelpLinkClass}
              onClick={() => window.open(MATERIALS_HELP_URL, '_blank', 'noopener,noreferrer')}
              data-umami-event="materials-page-empty-help"
            >
              {t('empty.helpLink')}
              <ArrowUpRight className="fill-icon-primary ml-1 size-4 shrink-0" />
            </Button>
          </div>
        </div>
        <div className="flex w-full shrink-0 justify-center px-2" aria-hidden>
          <EmptyMaterialsFull className="h-auto max-h-[min(42vh,360px)] w-full max-w-[min(92vw,420px)] object-contain sm:max-h-[min(48vh,400px)]" />
        </div>
      </div>
    </div>
  );
};
