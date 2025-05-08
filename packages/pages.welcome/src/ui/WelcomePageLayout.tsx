import { ReactNode } from 'react';
import { WelcomeSteps } from './WelcomeSteps';
import ProtectedProvider from '../providers';

export type WelcomePageLayoutPropsT = {
  step: 1 | 2 | 3;
  title: string;
  subtitle?: string | ReactNode;
  children: ReactNode;
};

export const WelcomePageLayout = ({ step, title, subtitle, children }: WelcomePageLayoutPropsT) => {
  return (
    <ProtectedProvider>
      <div className="relative flex min-h-svh flex-col">
        <div className="xs:h-screen flex h-[100dvh] w-screen flex-row content-center justify-center">
          <div className="flex h-full w-full content-center justify-center p-8">
            <div className="xs:p-8 flex h-full w-full max-w-[600px] flex-col">
              <div className="h-22">
                {/* <Logo height={24} width={202} logoVariant="navigation" logoSize="default" /> */}
                Лого
              </div>
              <WelcomeSteps step={step} />
              <div id="title" className="mt-8 text-2xl leading-[32px] font-semibold text-gray-100">
                {title}
              </div>
              {subtitle && <div className="mt-8 leading-[22px] text-gray-100">{subtitle}</div>}
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedProvider>
  );
};
