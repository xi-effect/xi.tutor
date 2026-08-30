import { Button } from '@xipkg/button';
import { ArrowUpRight } from '@xipkg/icons';
import {
  EmptyMaterialsFull,
  PageEmptyState,
  pageEmptyActionButtonClass,
  pageEmptyIllustrationClass,
} from 'common.ui';
import { useTranslation } from 'react-i18next';

/** База знаний — как на странице оплат */
const MATERIALS_HELP_URL = 'https://support.sovlium.ru/board-and-notes';

type MaterialsTabEmptyStateProps = {
  title: string;
  description: string;
};

/** Пустое состояние вкладки материалов (общая сетка PageEmptyState). */
export const MaterialsTabEmptyState = ({ title, description }: MaterialsTabEmptyStateProps) => {
  const { t } = useTranslation('materials');

  return (
    <PageEmptyState
      title={title}
      description={description}
      actions={
        <Button
          type="button"
          variant="none"
          className={pageEmptyActionButtonClass}
          onClick={() => window.open(MATERIALS_HELP_URL, '_blank', 'noopener,noreferrer')}
          data-umami-event="materials-page-empty-help"
        >
          {t('empty.helpLink')}
          <ArrowUpRight className="fill-icon-primary ml-1 size-4 shrink-0" />
        </Button>
      }
      illustration={<EmptyMaterialsFull className={pageEmptyIllustrationClass} />}
    />
  );
};
