import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import { Link } from '@xipkg/link';

import { Header } from './Header';
import { Filters } from './Filters';
import { CardsGrid } from './CardsGrid';

export const ClassroomsPage = () => {
  return (
    <div className="flex flex-col justify-between gap-6 pr-4 max-md:pl-4">
      <div className="flex flex-col gap-6 max-md:gap-4">
        <Header />

        <div className="flex flex-row items-center justify-between">
          <Filters />

          <Link href="#" className="text-m-base text-gray-80" variant="hover">
            Список учеников
          </Link>
        </div>

        <CardsGrid />
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
