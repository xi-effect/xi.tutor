import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@xipkg/dropdown';
import { ChevronSmallBottom } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { MaterialScopeFilterT } from '../types';

type MaterialsScopeFilterProps = {
  value: MaterialScopeFilterT;
  onChange: (scope: MaterialScopeFilterT) => void;
};

const SCOPE_OPTIONS: MaterialScopeFilterT[] = ['personal', 'classroom', 'all'];

export const MaterialsScopeFilter = ({ value, onChange }: MaterialsScopeFilterProps) => {
  const { t } = useTranslation('materials');
  const [open, setOpen] = useState(false);

  const handleSelect = (scope: MaterialScopeFilterT) => {
    onChange(scope);
    setOpen(false);
  };

  return (
    <div className="inline-flex w-fit">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'box-border flex h-[33px] w-fit max-w-full shrink-0 items-center gap-2 rounded-full border py-2 pr-3 pl-4',
              'bg-status-info-background border-border-focus text-s-base text-text-primary font-medium',
              'outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
            )}
            data-umami-event="materials-scope-filter"
            data-umami-event-scope={value}
          >
            <span className="whitespace-nowrap">{t(`scope.option.${value}`)}</span>
            <ChevronSmallBottom
              className={cn(
                'fill-icon-secondary size-4 shrink-0 transition-transform',
                open && 'rotate-180',
              )}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="border-border-default !bg-background-surface w-max min-w-[220px] rounded-2xl border p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)]"
        >
          <div className="flex w-full flex-col items-stretch gap-4 bg-transparent">
            {SCOPE_OPTIONS.map((scope) => {
              const selected = value === scope;

              return (
                <div
                  key={scope}
                  role="menuitemradio"
                  aria-checked={selected}
                  tabIndex={0}
                  className="text-s-base text-text-primary flex w-full cursor-pointer items-center gap-3 bg-transparent text-left font-medium outline-none"
                  onClick={() => handleSelect(scope)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleSelect(scope);
                    }
                  }}
                  data-umami-event="materials-scope-filter-option"
                  data-umami-event-scope={scope}
                >
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border bg-transparent',
                      selected
                        ? 'border-border-focus bg-action-primary-background-default'
                        : 'border-border-control',
                    )}
                  >
                    {selected ? (
                      <span className="bg-background-surface size-2 rounded-full" />
                    ) : null}
                  </span>
                  {t(`scope.option.${scope}`)}
                </div>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
