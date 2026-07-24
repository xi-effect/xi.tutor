import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { cn } from '@xipkg/utils';
import { MaterialsAdd } from 'features.materials.add';

const tabs = [
  { id: 'boards', label: 'Доски' },
  { id: 'notes', label: 'Заметки' },
];

interface HeaderProps {
  activeTab: 'notes' | 'boards';
  onTabChange: (tabId: string) => void;
}

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  return (
    <div className="inline-flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col items-start justify-start gap-4 sm:flex-row sm:items-center sm:gap-10">
        <h1 className="font-playfair text-text-primary pb-2 text-3xl font-medium sm:text-5xl">
          Материалы
        </h1>

        <SwitcherAnimate
          tabs={tabs}
          activeTab={activeTab}
          onChange={onTabChange}
          className="bg-background-subtle !h-auto w-full justify-start gap-0.5 rounded-[10px] p-1 sm:w-auto"
          tabClassName={cn(
            '!h-auto flex-1 items-start justify-start rounded-lg px-4 py-1.5 text-base leading-5 font-medium sm:flex-none',
            'data-[state=inactive]:text-text-secondary data-[state=inactive]:hover:text-text-secondary',
            'data-[state=active]:text-text-primary data-[state=active]:hover:text-text-primary',
          )}
          indicatorClassName="rounded-lg bg-background-surface shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
        />
      </div>

      <div className="hidden items-center justify-start sm:flex">
        <MaterialsAdd onlyDrafts kind={activeTab === 'boards' ? 'board' : 'note'} />
      </div>
    </div>
  );
};
