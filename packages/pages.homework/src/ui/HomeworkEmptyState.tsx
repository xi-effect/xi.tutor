import { Button } from '@xipkg/button';
import { ArrowUpRight } from '@xipkg/icons';
import {
  EmptyMaterialsFull,
  PageEmptyState,
  pageEmptyActionButtonClass,
  pageEmptyIllustrationClass,
} from 'common.ui';
import { useTranslation } from 'react-i18next';

const HOMEWORK_HELP_URL = 'https://support.sovlium.ru';

type HomeworkEmptyStateProps = {
  title: string;
  description: string;
};

export const HomeworkEmptyState = ({ title, description }: HomeworkEmptyStateProps) => {
  const { t } = useTranslation('homework');

  return (
    <PageEmptyState
      title={title}
      description={description}
      actions={
        <Button
          type="button"
          variant="none"
          className={pageEmptyActionButtonClass}
          onClick={() => window.open(HOMEWORK_HELP_URL, '_blank', 'noopener,noreferrer')}
          data-umami-event="homework-page-empty-help"
        >
          {t('empty.helpLink')}
          <ArrowUpRight className="fill-icon-primary ml-1 size-4 shrink-0" />
        </Button>
      }
      illustration={<EmptyMaterialsFull className={pageEmptyIllustrationClass} />}
    />
  );
};
