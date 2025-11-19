import { ReactNode } from 'react';
import { Logo } from 'common.ui';

export type EmailPageLayoutPropsT = {
  title: string;
  children: ReactNode;
};

export const EmailPageLayout = ({ title, children }: EmailPageLayoutPropsT) => {
  return (
    <div className="xs:h-screen dark:bg-gray-0 flex h-dvh w-screen flex-col flex-wrap content-center justify-center p-1">
      <div className="xs:border xs:border-gray-10 xs:rounded-2xl dark:bg-gray-5 flex min-h-[348px] w-full max-w-[420px]">
        <div className="xs:p-8 flex h-full w-full flex-col items-center p-4">
          <div className="h-8">
            <Logo height={32} width={108} />
          </div>
          <div id="title" className="text-l-base mt-4 font-semibold text-gray-100">
            {title}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
