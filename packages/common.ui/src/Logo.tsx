import lightLogo from '/assets/brand/navigationlogo-default-light.svg';
import darkLogo from '/assets/brand/navigationlogo-default-dark.svg';

export const Logo = ({ width = 135, height = 16 }: { width?: number; height?: number }) => {
  return (
    <>
      <img src={lightLogo} alt="logo" width={width} height={height} className="dark:hidden" />
      <img src={darkLogo} alt="logo" width={width} height={height} className="hidden dark:block" />
    </>
  );
};
