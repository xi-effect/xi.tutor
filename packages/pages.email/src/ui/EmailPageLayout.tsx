import { ReactNode } from 'react';
import { AuthFlowShell } from 'common.ui';
import { SupportPageShell } from 'modules.navigation';

export type EmailPageLayoutPropsT = {
  title: string;
  children: ReactNode;
};

export const EmailPageLayout = ({ title, children }: EmailPageLayoutPropsT) => {
  return (
    <SupportPageShell>
      <AuthFlowShell title={title} cardClassName="min-h-[348px]">
        {children}
      </AuthFlowShell>
    </SupportPageShell>
  );
};
