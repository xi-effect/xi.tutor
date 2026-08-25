import { sectionTitleClass } from '../../sectionTitleClass';

export const MaterialHeader = ({ title }: { title: string }) => {
  return (
    <div className="flex flex-row items-center justify-start gap-2">
      <h2 className={sectionTitleClass}>{title}</h2>
    </div>
  );
};
