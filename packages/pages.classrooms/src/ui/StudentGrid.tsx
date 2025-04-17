import React from 'react';
import { StudentCard } from './StudentCard';
import { Student } from '../types';
interface StudentGridProps {
  students: Student[];
  onStudentClick?: (student: Student) => void;
}

export const StudentGrid: React.FC<StudentGridProps> = ({ students, onStudentClick }) => {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {students.map((student) => (
        <StudentCard
          key={student.id}
          name={student.name}
          avatar={student.avatar}
          status={student.status}
          groupSize={student.groupSize}
          onClick={() => onStudentClick?.(student)}
        />
      ))}
    </div>
  );
};
