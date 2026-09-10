import { SEARCH_FILTER_MAX_LENGTH } from 'common.api';
import { Search } from '@xipkg/icons';
import { cn } from '@xipkg/utils';

type MathBankSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

export const MathBankSearchField = ({
  value,
  onChange,
  placeholder,
  className,
}: MathBankSearchFieldProps) => (
  <div
    className={cn(
      'border-border-control bg-background-surface focus-within:border-border-focus flex h-[33px] w-full shrink-0 items-center gap-2 rounded-full border px-3 sm:w-64',
      className,
    )}
  >
    <Search className="fill-icon-secondary size-4 shrink-0" />
    <input
      value={value}
      onChange={(event) => onChange(event.target.value.slice(0, SEARCH_FILTER_MAX_LENGTH))}
      placeholder={placeholder}
      maxLength={SEARCH_FILTER_MAX_LENGTH}
      className="text-s-base text-text-primary placeholder:text-text-secondary min-w-0 flex-1 bg-transparent leading-5 font-medium outline-none"
    />
  </div>
);
