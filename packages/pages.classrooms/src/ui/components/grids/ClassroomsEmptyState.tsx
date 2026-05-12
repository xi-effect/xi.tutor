import { Button } from '@xipkg/button';
import { ArrowUpRight } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { EmptyClassrooms } from 'common.ui';

const CLASSROOMS_HELP_URL = 'https://support.sovlium.ru/classrooms';

const emptyClassroomsHelpLinkClass =
  'bg-gray-5 hover:bg-gray-10 text-xs-base h-8 rounded-lg px-4 font-medium text-gray-80';

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
}: ClassroomsEmptyStateProps) => (
  <div className="bg-gray-0 ml-4 box-border flex h-[calc(100dvh-120px)] w-full flex-col rounded-tl-2xl pt-2 pr-5 pb-4 pl-5">
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-hidden',
        'px-6 py-10 sm:gap-10 sm:px-8 sm:py-12',
      )}
    >
      <div className="flex max-w-md flex-col gap-2 text-center">
        <p className="text-l-base font-semibold text-gray-100">{title}</p>
        <p className="text-s-base text-gray-60 dark:text-gray-50">{description}</p>
        {withHelpLink ? (
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="none"
              className={emptyClassroomsHelpLinkClass}
              onClick={() => window.open(CLASSROOMS_HELP_URL, '_blank', 'noopener,noreferrer')}
              data-umami-event="classrooms-page-empty-help"
            >
              Подробнее о работе с кабинетами
              <ArrowUpRight className="fill-gray-80 ml-1 size-4 shrink-0" />
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
