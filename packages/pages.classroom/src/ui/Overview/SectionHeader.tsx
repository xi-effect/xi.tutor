import { type ReactNode } from 'react';
import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { sectionTitleClass } from '../sectionTitleClass';

type SectionHeaderProps = {
  title: string;
  tabLink?: string;
  actions?: ReactNode;
};

export const SectionHeader = ({ title, tabLink, actions }: SectionHeaderProps) => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const handleTabChange = (tab: string) => {
    const filteredSearch = search.call ? { call: search.call } : {};

    navigate({
      search: {
        // @ts-expect-error - TanStack Router search type inference issue
        tab,
        ...filteredSearch,
      },
    });
  };

  return (
    <div className="flex w-full min-w-0 flex-row flex-wrap items-center gap-2">
      <div className="flex min-w-0 flex-row items-center gap-1">
        <h2 className={sectionTitleClass}>{title}</h2>
        {tabLink ? (
          <Button
            variant="none"
            className="hover:bg-background-subtle flex size-8 shrink-0 translate-y-1 items-center justify-center rounded-lg p-0"
            onClick={() => handleTabChange(tabLink)}
          >
            <ArrowRight className="fill-icon-secondary size-5" />
          </Button>
        ) : null}
      </div>
      {actions ? <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
};
