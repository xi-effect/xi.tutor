import { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { Input } from '@xipkg/input';
import { INVOICE_FILTER_MAX_COUNTERPARTIES } from 'common.api';
import { useStudentsList, useTutorsList } from 'common.services';
import type { TutorStudentSchemaMarshal } from 'common.types';
import { useTranslation } from 'react-i18next';
import { PaymentsFilterActions, PaymentsFilterChip, PaymentsFilterOption } from './filterControls';
import { paymentsFilterPopoverClass, paymentsFilterPopoverProps } from './paymentsFilterState';

type PersonOption = {
  id: number;
  name: string;
};

type TutorListItem = {
  tutorship?: { tutor_id?: number };
  user?: { username?: string; display_name?: string | null };
};

type PaymentsPeopleFilterProps = {
  isTutor: boolean;
  value: number[];
  onChange: (ids: number[]) => void;
};

const personName = (
  user: { username?: string; display_name?: string | null } | undefined,
  id: number,
) => user?.display_name?.trim() || user?.username || String(id);

export const PaymentsPeopleFilter = ({ isTutor, value, onChange }: PaymentsPeopleFilterProps) => {
  const { t } = useTranslation('payments');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<number[]>(value);
  const [query, setQuery] = useState('');
  const studentsQuery = useStudentsList({ disabled: !open || !isTutor });
  const tutorsQuery = useTutorsList({ disabled: !open || isTutor });

  const options = useMemo<PersonOption[]>(() => {
    const source = isTutor
      ? ((studentsQuery.data as TutorStudentSchemaMarshal[] | undefined) ?? []).flatMap((item) => {
          const id = item.tutorship?.student_id;
          if (!id) {
            return [];
          }

          return [{ id, name: personName(item.user, id) }];
        })
      : ((Array.isArray(tutorsQuery.data) ? tutorsQuery.data : []) as TutorListItem[]).flatMap(
          (item) => {
            const id = item.tutorship?.tutor_id;
            if (!id) {
              return [];
            }

            return [{ id, name: personName(item.user, id) }];
          },
        );

    return source.sort((left, right) => left.name.localeCompare(right.name, 'ru'));
  }, [isTutor, studentsQuery.data, tutorsQuery.data]);

  const visibleOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => option.name.toLocaleLowerCase().includes(normalizedQuery));
  }, [options, query]);

  const isLoading = isTutor ? studentsQuery.isLoading : tutorsQuery.isLoading;
  const limitReached = draft.length >= INVOICE_FILTER_MAX_COUNTERPARTIES;

  useEffect(() => {
    if (open) {
      setDraft(value);
      setQuery('');
    }
  }, [open, value]);

  const togglePerson = (id: number) => {
    setDraft((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= INVOICE_FILTER_MAX_COUNTERPARTIES) {
        return current;
      }

      return [...current, id];
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PaymentsFilterChip
          open={open}
          selected={value.length > 0}
          data-umami-event="payments-counterparty-filter"
        >
          {value.length > 0
            ? t(isTutor ? 'filters.studentChipCount' : 'filters.tutorChipCount', {
                count: value.length,
              })
            : t(isTutor ? 'filters.studentChip' : 'filters.tutorChip')}
        </PaymentsFilterChip>
      </PopoverTrigger>
      <PopoverContent {...paymentsFilterPopoverProps} className={paymentsFilterPopoverClass}>
        <div className="flex w-full flex-col gap-3">
          <Input
            value={query}
            placeholder={t('filters.peopleSearch')}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex max-h-[min(15rem,40dvh)] w-full flex-col items-stretch gap-3 overflow-y-auto bg-transparent">
            {isLoading ? (
              <p className="text-s-base text-text-secondary">{t('filters.peopleLoading')}</p>
            ) : visibleOptions.length > 0 ? (
              visibleOptions.map((option) => (
                <PaymentsFilterOption
                  key={option.id}
                  selected={draft.includes(option.id)}
                  onSelect={() => togglePerson(option.id)}
                  umamiEvent="payments-counterparty-filter-option"
                  umamiScope={String(option.id)}
                >
                  {option.name}
                </PaymentsFilterOption>
              ))
            ) : (
              <p className="text-s-base text-text-secondary">
                {t(isTutor ? 'filters.peopleEmptyStudent' : 'filters.peopleEmptyTutor')}
              </p>
            )}
          </div>
          {limitReached ? (
            <p className="text-xs-base text-text-secondary">{t('filters.peopleLimit')}</p>
          ) : null}
        </div>
        <PaymentsFilterActions
          canReset={draft.length > 0}
          onReset={() => setDraft([])}
          onApply={() => {
            onChange(draft);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
