import { Button } from '@xipkg/button';
import { Plus, Filter } from '@xipkg/icons';

import { ButtonsHeader, LinkListStudents, CardsGridSimple } from './components';
import { useCurrentUser } from 'common.services';

export const ClassroomsPage = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  return (
    <div className="flex flex-col justify-between gap-6 pr-0 pl-4">
      <div className="flex flex-col">
        <div className="flex flex-row items-center pt-1 pb-4">
          <h1 className="text-2xl font-semibold text-gray-100">Кабинеты</h1>
          <div className="ml-auto flex items-center">{isTutor && <LinkListStudents src="#" />}</div>

          {isTutor && <ButtonsHeader />}

          <div className="ml-auto flex items-center min-[570px]:hidden">
            <Button variant="none" size="s" data-umami-event="classrooms-filter">
              <Filter className="fill-gray-100" />
            </Button>
          </div>
        </div>

        <CardsGridSimple />
      </div>

      <div className="flex flex-row items-center justify-end sm:hidden">
        {isTutor && (
          <Button
            size="s"
            className="fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-xl"
            data-umami-event="classrooms-create-classroom"
          >
            <Plus className="fill-brand-0" />
          </Button>
        )}
      </div>
    </div>
  );
};
