export type StudentT = {
  id: string;
  name: string;
  subjects: SubjectT[];
};

export type SubjectT = {
  id: string;
  name: string;
  variant: string;
  pricePerLesson: number;
  unpaidLessonsAmount?: number;
};
