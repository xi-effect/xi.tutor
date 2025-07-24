import { ScrollArea } from '@xipkg/scrollarea';
import { classroomsMock } from '../mocks';

import { Card } from './Card';

export const CardsGrid = () => {
  return (
    <ScrollArea className="h-[calc(100vh-204px)] w-full pr-4">
      <div className="max-xs:gap-4 grid grid-cols-1 gap-8 min-[550px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {classroomsMock.map((classroom) => (
          <Card key={classroom.id.toString()} {...classroom} />
        ))}
      </div>
    </ScrollArea>
  );
};
