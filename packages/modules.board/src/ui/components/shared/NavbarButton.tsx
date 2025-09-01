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
    className={`pointer-events-auto flex h-6 w-6 items-center justify-center rounded-lg lg:h-8 lg:w-8 ${isActive ? 'bg-brand-0' : 'bg-gray-0'} ${className ?? ''}`}
    {...props}
  >
    {icon ?? title}
  </button>
);
