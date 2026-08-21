import { ReactNode } from 'react';
import { WelcomeSteps } from './WelcomeSteps';
import { ProtectedProvider } from '../providers';
import { InviteProgressCard, Logo } from 'common.ui';
import { SupportPageShell } from 'modules.navigation';

export type WelcomePageLayoutPropsT = {
  step: 1 | 2 | 3;
  title: string;
  subtitle?: string | ReactNode;
  children: ReactNode;
};

export const WelcomePageLayout = ({ step, title, subtitle, children }: WelcomePageLayoutPropsT) => {
  return (
    <ProtectedProvider>
      <SupportPageShell>
        <div className="flex w-full flex-1 flex-row content-center justify-center">
          <div className="flex w-full flex-1 content-center justify-center p-4 sm:p-8">
            <div className="xs:p-8 flex w-full max-w-[600px] min-w-0 flex-1 flex-col">
              <div className="h-22">
                <Logo />
              </div>
              <WelcomeSteps step={step} />
              <InviteProgressCard className="mt-6" />
              <div
                id="title"
                className="text-text-primary dark:text-text-primary mt-8 text-2xl leading-[32px] font-semibold break-words"
              >
                {title}
              </div>
              {subtitle && (
                <div className="text-text-primary dark:text-text-primary mt-8 leading-[22px]">
                  {subtitle}
                </div>
              )}
              {children}
            </div>
          </div>
        </div>
      </SupportPageShell>
    </ProtectedProvider>
  );
};
