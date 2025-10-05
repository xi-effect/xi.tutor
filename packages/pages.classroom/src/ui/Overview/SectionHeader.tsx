import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { useNavigate } from '@tanstack/react-router';

type SectionHeaderProps = {
  title: string;
  tabLink: string;
};

export const SectionHeader = ({ title, tabLink: tabLink }: SectionHeaderProps) => {
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    navigate({
      from: '/classrooms/$classroomId',
      search: { tab },
    });
  };

  return (
    <div className="flex flex-row items-center justify-start gap-2">
      <h2 className="text-xl-base font-semibold text-gray-100 first-letter:uppercase">{title}</h2>
      <Button
        variant="ghost"
        className="flex size-8 items-center justify-center rounded-[4px] p-0"
        onClick={() => handleTabChange(tabLink)}
      >
        <ArrowRight className="fill-gray-60 size-6" />
      </Button>
    </div>
  );
};
