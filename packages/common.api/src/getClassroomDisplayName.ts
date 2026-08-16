export type ClassroomDisplayNameSource = {
  name?: string | null;
  name_override?: string | null;
};

export const getClassroomDisplayName = (classroom: ClassroomDisplayNameSource): string => {
  const override = classroom.name_override?.trim();
  if (override) return override;
  return classroom.name?.trim() ?? '';
};
