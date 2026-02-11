import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { useNavigate, useSearch } from '@tanstack/react-router';

type SectionHeaderProps = {
  title: string;
  tabLink: string;
};

export const SectionHeader = ({ title, tabLink: tabLink }: SectionHeaderProps) => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const handleTabChange = (tab: string) => {
    // Сохраняем параметр call при переходе на таб
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
    <div className="flex flex-row items-center justify-start gap-2">
      <h2 className="text-xl-base font-semibold text-gray-100 first-letter:uppercase">{title}</h2>
      <Button
        variant="none"
        className="flex size-8 items-center justify-center rounded-[4px] p-0"
        onClick={() => handleTabChange(tabLink)}
      >
        <ArrowRight className="fill-gray-60 size-6" />
      </Button>
    </div>
  );
};
