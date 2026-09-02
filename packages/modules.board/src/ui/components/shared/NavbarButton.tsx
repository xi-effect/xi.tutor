import { forwardRef } from 'react';
import { cn } from '@xipkg/utils';
import { boardIconClass } from '../../boardTheme';

type NavbarButtonPropsT = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive: boolean;
  icon?: React.ReactNode;
  title?: string;
};

export const NavbarButton = forwardRef<HTMLButtonElement, NavbarButtonPropsT>(
  ({ isActive, icon, title, className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={title}
      data-isactive={isActive}
      className={cn(
        'pointer-events-auto flex shrink-0 items-center justify-center rounded-lg transition-colors',
        'size-12 sm:size-6 lg:size-8',
        boardIconClass,
        isActive ? 'bg-status-info-background' : 'hover:bg-status-info-background bg-transparent',
        className,
      )}
      {...props}
    >
      {icon ?? title}
    </button>
  ),
);

NavbarButton.displayName = 'NavbarButton';
