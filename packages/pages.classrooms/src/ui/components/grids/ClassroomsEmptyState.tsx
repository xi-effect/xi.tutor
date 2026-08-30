import { Button } from '@xipkg/button';
import { ArrowUpRight } from '@xipkg/icons';
import {
  EmptyClassrooms,
  PageEmptyState,
  pageEmptyActionButtonClass,
  pageEmptyIllustrationClass,
} from 'common.ui';
import { useTranslation } from 'react-i18next';

const CLASSROOMS_HELP_URL = 'https://support.sovlium.ru/classrooms';

type ClassroomsEmptyStateProps = {
  title: string;
  description: string;
  /** Ссылка в базу знаний — только для репетитора (как на странице оплат). */
  withHelpLink?: boolean;
};

/** Пустое состояние списка кабинетов (общая сетка PageEmptyState). */
export const ClassroomsEmptyState = ({
  title,
  description,
  withHelpLink = false,
}: ClassroomsEmptyStateProps) => {
  const { t } = useTranslation('classrooms');

  return (
    <PageEmptyState
      title={title}
      description={description}
      actions={
        withHelpLink ? (
          <Button
            type="button"
            variant="none"
            className={pageEmptyActionButtonClass}
            onClick={() => window.open(CLASSROOMS_HELP_URL, '_blank', 'noopener,noreferrer')}
            data-umami-event="classrooms-page-empty-help"
          >
            {t('empty.helpLink')}
            <ArrowUpRight className="fill-icon-primary ml-1 size-4 shrink-0" />
          </Button>
        ) : undefined
      }
      illustration={<EmptyClassrooms className={pageEmptyIllustrationClass} />}
    />
  );
};
