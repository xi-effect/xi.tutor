import { mockStudents } from '../mocks';
import { StudentGrid } from './StudentGrid';
import { Header } from './Header';
import { SubHeader } from './SubHeader';

export const ClassroomsPage = () => {
  return (
    <div>
      <Header />
      <SubHeader />
      <StudentGrid students={mockStudents} />
    </div>
  );
};
