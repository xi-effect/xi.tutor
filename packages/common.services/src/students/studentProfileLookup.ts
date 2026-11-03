import type { TutorStudentSchemaMarshal } from 'common.types';

export type StudentProfileFromList = {
  username: string;
  display_name: string | null;
  name: string | null;
};

export const findStudentProfile = (
  students: TutorStudentSchemaMarshal[] | undefined,
  studentId: number,
): StudentProfileFromList | undefined => {
  if (!studentId || !Array.isArray(students)) return undefined;

  const match = students.find((student) => student.tutorship?.student_id === studentId);
  if (!match?.user) return undefined;

  return {
    username: match.user.username,
    display_name: match.user.display_name,
    name: match.user.display_name,
  };
};

export const shouldRequestStudentById = ({
  skip,
  listSettled,
  hasProfile,
}: {
  skip: boolean;
  listSettled: boolean;
  hasProfile: boolean;
}) => !skip && listSettled && !hasProfile;
