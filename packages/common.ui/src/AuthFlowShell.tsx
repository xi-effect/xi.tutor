import { type ReactNode, useEffect, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { cn } from '@xipkg/utils';
import { InviteProgressCard } from './InviteProgressCard';
import { Logo } from './Logo';

export const AUTH_FLOW_LOGO_SIZE = { width: 120, height: 15 } as const;

type AuthStageEnterProps = {
  children: ReactNode;
  className?: string;
};

export const AuthStageEnter = ({ children, className }: AuthStageEnterProps) => {
  const [ready, setReady] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  useEffect(() => {
    if (ready) return;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [ready]);

  return (
    <div
      className={cn(
        'flex flex-1 flex-col transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none',
        ready ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
};

type AuthFlowShellProps = {
  title: string;
  children: ReactNode;
  showInviteProgress?: boolean;
  isAuthenticated?: boolean;
  cardClassName?: string;
};

export const AuthFlowShell = ({
  title,
  children,
  showInviteProgress = true,
  isAuthenticated,
  cardClassName,
}: AuthFlowShellProps) => {
  const location = useLocation();

  return (
    <div className="flex w-full flex-1 flex-col">
      {showInviteProgress ? (
        <InviteProgressCard isAuthenticated={isAuthenticated} placement="pageTop" />
      ) : null}
      <div className="flex w-full flex-1 flex-col items-center justify-center p-1 py-4">
        <div
          className={cn(
            'xs:border-border-default xs:rounded-2xl xs:border xs:p-8',
            'flex w-full max-w-105 min-w-0 flex-col bg-transparent p-4',
            cardClassName ?? 'min-h-150',
          )}
        >
          <AuthStageEnter key={location.pathname}>
            <div className="mb-4 flex flex-col items-center gap-4">
              <Logo width={AUTH_FLOW_LOGO_SIZE.width} height={AUTH_FLOW_LOGO_SIZE.height} />
              <h1 className="text-text-primary text-2xl font-semibold">{title}</h1>
            </div>
            {children}
          </AuthStageEnter>
        </div>
      </div>
    </div>
  );
};
