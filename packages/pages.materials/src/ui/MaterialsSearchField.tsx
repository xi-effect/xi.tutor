import { Search } from '@xipkg/icons';
import { SEARCH_FILTER_MAX_LENGTH } from 'common.api';

type MaterialsSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export const MaterialsSearchField = ({
  value,
  onChange,
  placeholder,
}: MaterialsSearchFieldProps) => (
  <div className="border-border-control bg-background-surface focus-within:border-border-focus flex h-[33px] w-full items-center gap-2 rounded-full border px-3 sm:w-64">
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
