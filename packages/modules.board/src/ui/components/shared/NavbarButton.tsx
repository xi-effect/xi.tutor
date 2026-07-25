import { cn } from '@xipkg/utils';

type NavbarButtonPropsT = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive: boolean;
  icon?: React.ReactNode;
  title?: string;
};

export const NavbarButton = ({
  isActive,
  icon,
  title,
  className,
  ...props
}: NavbarButtonPropsT) => (
  <button
    type="button"
    data-isactive={isActive}
    className={cn(
      'pointer-events-auto flex shrink-0 items-center justify-center rounded-lg transition-colors',
      'size-12 sm:size-6 lg:size-8',
      isActive
        ? 'bg-status-info-background'
        : 'bg-background-surface hover:bg-status-info-background',
      className,
    )}
    {...props}
  >
    {icon ?? title}
  </button>
);
