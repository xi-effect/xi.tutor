type SubjectPropsT = {
  subject: string;
};

export const SubjectCell = ({ subject }: SubjectPropsT) => {
  return <p className="text-text-primary text-m-base font-normal">{subject}</p>;
};
