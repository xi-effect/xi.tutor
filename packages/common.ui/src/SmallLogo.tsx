export const SmallLogo = ({ width = 135, height = 16 }: { width?: number; height?: number }) => {
  return (
    <>
      <img
        src="/assets/brand/navigationlogo-small-light-new.svg"
        alt="logo"
        width={width}
        height={height}
        className="dark:hidden"
      />
      <img
        src="/assets/brand/navigationlogo-small-dark-new.svg"
        alt="logo"
        width={width}
        height={height}
        className="hidden dark:block"
      />
    </>
  );
};
