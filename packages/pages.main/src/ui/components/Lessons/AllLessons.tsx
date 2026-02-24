import type { ScheduleLessonRow } from './Lesson';
import { Lesson } from './Lesson';

type AllLessonsProps = {
  lessons: ScheduleLessonRow[];
};

export const AllLessons = ({ lessons }: AllLessonsProps) => {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      {lessons.map((lesson, index) => (
        <Lesson key={lesson.id} lesson={lesson} showActions={index === 0} />
      ))}
    </div>
  );
};
