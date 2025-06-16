type SubjectPropsT = {
  subject: string;
};

export const SubjectCell = ({ subject }: SubjectPropsT) => {
  return <p className="text-gray-80 text-m-base font-normal">{subject}</p>;
};
