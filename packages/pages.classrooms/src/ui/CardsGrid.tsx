import { classroomsMock } from '../mocks';

import { Card } from './Card';

export const CardsGrid = () => {
  return (
    <div className="max-xs:gap-4 grid grid-cols-1 gap-8 min-[550px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {classroomsMock.map((classroom) => (
        <Card key={classroom.id} {...classroom} />
      ))}
    </div>
  );
};
