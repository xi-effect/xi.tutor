import { DateTimeDisplay } from 'common.ui';
import { MobileTutorActionButton } from 'features.invites';
import { ButtonsHeader, LinkListStudents, CardsGridSimple } from './components';
import { useCurrentUser } from 'common.services';

export const ClassroomsPage = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  return (
    <div className="bg-gray-5 flex h-full min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-col gap-5 px-5 pt-5">
        <div className="flex h-8 items-center">
          <DateTimeDisplay />
        </div>
        <div className="flex flex-row items-center pb-4">
          <h1 className="text-2xl font-normal text-gray-100">Кабинеты</h1>

          <div className="mr-2 ml-auto flex items-center">
            {isTutor && <LinkListStudents src="#" />}
          </div>

          {isTutor && <ButtonsHeader />}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <CardsGridSimple />
      </div>

      <MobileTutorActionButton variant="classrooms" />
    </div>
  );
};
