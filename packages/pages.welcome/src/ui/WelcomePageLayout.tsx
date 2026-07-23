import { ReactNode } from 'react';
import { WelcomeSteps } from './WelcomeSteps';
import { ProtectedProvider } from '../providers';
import { Logo } from 'common.ui';
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
          <div className="flex w-full flex-1 content-center justify-center p-8">
            <div className="xs:p-8 flex w-full max-w-[600px] flex-1 flex-col">
              <div className="h-22">
                <Logo />
              </div>
              <WelcomeSteps step={step} />
              <div
                id="title"
                className="mt-8 text-2xl leading-[32px] font-semibold text-gray-100 dark:text-gray-100"
              >
                {title}
              </div>
              {subtitle && (
                <div className="mt-8 leading-[22px] text-gray-100 dark:text-gray-100">
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
