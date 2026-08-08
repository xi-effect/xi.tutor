import { ReactNode } from 'react';
import { Logo } from 'common.ui';
import { SupportPageShell } from 'modules.navigation';

export type EmailPageLayoutPropsT = {
  title: string;
  children: ReactNode;
};

export const EmailPageLayout = ({ title, children }: EmailPageLayoutPropsT) => {
  return (
    <SupportPageShell>
      <div className="flex w-full flex-1 flex-col items-center justify-center p-1 py-4">
        <div className="xs:border xs:border-border-default xs:rounded-2xl flex min-h-[348px] w-full max-w-[420px] bg-transparent">
          <div className="xs:p-8 flex w-full flex-col items-center p-4">
            <div className="h-8">
              <Logo height={32} width={108} />
            </div>
            <div id="title" className="text-l-base text-text-primary mt-4 font-semibold">
              {title}
            </div>
            {children}
          </div>
        </div>
      </div>
    </SupportPageShell>
  );
};
