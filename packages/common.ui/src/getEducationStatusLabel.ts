const EDUCATION_STATUSES = ['active', 'paused', 'locked', 'finished'] as const;

type EducationStatus = (typeof EDUCATION_STATUSES)[number];

const isEducationStatus = (status: string): status is EducationStatus =>
  EDUCATION_STATUSES.includes(status as EducationStatus);

export const getEducationStatusLabel = (
  status: string,
  isTutor: boolean,
  t: (key: string) => string,
) => {
  if (!isEducationStatus(status)) {
    return t('educationStatus.unknown');
  }

  const role = isTutor ? 'tutor' : 'student';
  return t(`educationStatus.${role}.${status}`);
};
