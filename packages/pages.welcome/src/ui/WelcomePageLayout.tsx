import { ReactNode } from 'react';
import { useLocation, useSearch } from '@tanstack/react-router';
import { WelcomeSteps } from './WelcomeSteps';
import { ProtectedProvider } from '../providers';
import { AUTH_FLOW_LOGO_SIZE, InviteProgressCard, Logo } from 'common.ui';
import { getInviteProgress } from 'common.utils';
import { SupportPageShell } from 'modules.navigation';
import { cn } from '@xipkg/utils';

export type WelcomePageLayoutPropsT = {
  step: 1 | 2 | 3;
  title: string;
  subtitle?: string | ReactNode;
  children: ReactNode;
};

export const WelcomePageLayout = ({ step, title, subtitle, children }: WelcomePageLayoutPropsT) => {
  const location = useLocation();
  const search = useSearch({ strict: false }) as { invite?: string; redirect?: string };
  const hasInviteProgress = Boolean(getInviteProgress({ pathname: location.pathname, search }));

  return (
    <ProtectedProvider>
      <SupportPageShell>
        <div className="flex w-full flex-1 flex-col">
          {hasInviteProgress ? <InviteProgressCard placement="pageTop" /> : null}
          <div className="flex w-full flex-1 flex-row content-center justify-center">
            <div className="flex w-full flex-1 content-center justify-center p-4 sm:p-8">
              <div className="xs:p-8 flex w-full max-w-[600px] min-w-0 flex-1 flex-col">
                {hasInviteProgress ? (
                  <div className="mb-4">
                    <Logo width={AUTH_FLOW_LOGO_SIZE.width} height={AUTH_FLOW_LOGO_SIZE.height} />
                  </div>
                ) : (
                  <>
                    <div className="h-22">
                      <Logo />
                    </div>
                    <WelcomeSteps step={step} />
                  </>
                )}
                <div
                  id="title"
                  className={cn(
                    'text-text-primary dark:text-text-primary text-2xl leading-[32px] font-semibold break-words',
                    hasInviteProgress ? 'mt-4' : 'mt-8',
                  )}
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
        </div>
      </SupportPageShell>
    </ProtectedProvider>
  );
};
