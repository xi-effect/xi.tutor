import { type WelcomePageLayoutPropsT } from './WelcomePageLayout';

const colors = {
  active: 'bg-brand-80',
  default: 'bg-gray-10',
};

export const WelcomeSteps = ({ step }: Pick<WelcomePageLayoutPropsT, 'step'>) => {
  return (
    <div className="mt-16 flex w-full flex-row items-start justify-between gap-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className={`${item <= step ? colors.active : colors.default} h-1.5 w-full rounded`}
        />
      ))}
    </div>
  );
};
