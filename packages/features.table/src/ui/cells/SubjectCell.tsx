type SubjectPropsT = {
  subject: string;
};

export const SubjectCell = ({ subject }: SubjectPropsT) => {
  return <span>{subject}</span>;
};
