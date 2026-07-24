import { Button } from '@xipkg/button';
import { ArrowUpRight } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { EmptyClassrooms } from 'common.ui';
import { useTranslation } from 'react-i18next';

const CLASSROOMS_HELP_URL = 'https://support.sovlium.ru/classrooms';

const emptyClassroomsHelpLinkClass =
  'bg-background-page hover:bg-background-subtle text-xs-base h-8 rounded-lg px-4 font-medium text-text-primary';

type ClassroomsEmptyStateProps = {
  title: string;
  description: string;
  /** Ссылка в базу знаний — только для репетитора (как на странице оплат). */
  withHelpLink?: boolean;
};

/** Пустое состояние списка кабинетов (вёрстка как у материалов / оплат). */
export const ClassroomsEmptyState = ({
  title,
  description,
  withHelpLink = false,
}: ClassroomsEmptyStateProps) => {
  const { t } = useTranslation('classrooms');

  return (
    <div className="box-border flex h-full min-h-0 w-full flex-col px-5 pb-5 sm:px-10 sm:pb-10">
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-hidden',
          'px-6 py-10 sm:gap-10 sm:px-8 sm:py-12',
        )}
      >
        <div className="flex max-w-md flex-col gap-2 text-center">
          <p className="text-l-base text-text-primary font-semibold">{title}</p>
          <p className="text-s-base text-text-secondary dark:text-text-muted">{description}</p>
          {withHelpLink ? (
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="none"
                className={emptyClassroomsHelpLinkClass}
                onClick={() => window.open(CLASSROOMS_HELP_URL, '_blank', 'noopener,noreferrer')}
                data-umami-event="classrooms-page-empty-help"
              >
                {t('empty.helpLink')}
                <ArrowUpRight className="fill-icon-primary ml-1 size-4 shrink-0" />
              </Button>
            </div>
          ) : null}
        </div>
        <div className="flex w-full shrink-0 justify-center px-2" aria-hidden>
          <EmptyClassrooms className="h-auto max-h-[min(38vh,280px)] w-full max-w-[min(88vw,400px)] object-contain sm:max-h-[min(42vh,320px)]" />
        </div>
      </div>
    </div>
  );
};
