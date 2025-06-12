import { Button } from '@xipkg/button';
import { Plus, Filter } from '@xipkg/icons';

import { ButtonsHeader } from './ButtonsHeader';
import { LinkListStudents } from './LinkListStudents';
import { Filters } from './Filters';
import { CardsGrid } from './CardsGrid';

export const ClassroomsPage = () => {
  return (
    <div className="flex flex-col justify-between gap-6 pr-0 pl-4">
      <div className="flex flex-col gap-6 max-md:gap-4">
        <div className="flex flex-row items-center pt-1">
          <h1 className="text-2xl font-semibold text-gray-100">Кабинеты</h1>

          <ButtonsHeader />

          <div className="ml-auto flex items-center max-[570px]:hidden sm:hidden">
            <LinkListStudents src="#" />
          </div>

          <div className="ml-auto flex items-center min-[570px]:hidden">
            <Button variant="ghost" size="s">
              <Filter className="fill-gray-100" />
            </Button>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between">
          <Filters className="max-[570px]:hidden" />

          <div className="max-sm:hidden">
            <LinkListStudents src="#" />
          </div>
        </div>

        <CardsGrid />
      </div>

      <div className="flex flex-row items-center justify-end sm:hidden">
        <Button
          size="s"
          className="fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-xl"
        >
          <Plus className="fill-brand-0" />
        </Button>
      </div>
    </div>
  );
};
