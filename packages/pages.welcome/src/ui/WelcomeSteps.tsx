import { type WelcomePageLayoutPropsT } from './WelcomePageLayout';

import { cn } from '@xipkg/utils';

const colors = {
  active: 'bg-action-primary-background-default',
  default: 'bg-background-subtle',
};

export const WelcomeSteps = ({ step }: Pick<WelcomePageLayoutPropsT, 'step'>) => {
  return (
    <div className="xs:mt-16 mt-1 flex w-full flex-row items-start justify-between gap-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className={`${colors.default} h-1.5 w-full overflow-hidden rounded`}>
          <div
            className={cn(
              colors.active,
              'h-full w-full origin-left rounded transition-transform duration-500 ease-out motion-reduce:transition-none',
              item <= step ? 'scale-x-100' : 'scale-x-0',
            )}
          />
        </div>
      ))}
    </div>
  );
};
