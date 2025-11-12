import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';

import { Header } from './Header';
import { Tabs } from './Tabs';

export const ClassroomPage = () => {
  return (
    <div className="flex h-full flex-col justify-between gap-6 overflow-y-auto pr-4 max-md:pl-4">
      <div className="flex flex-col pt-1">
        <Header />
        <Tabs />
      </div>

      <div className="xs:hidden flex flex-row items-center justify-end">
        <Button
          size="small"
          className="fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-xl"
        >
          <Plus className="fill-brand-0" />
        </Button>
      </div>
    </div>
  );
};
