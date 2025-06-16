export const Logo = ({ width = 135, height = 16 }: { width?: number; height?: number }) => {
  return (
    <img
      src="/assets/brand/navigationlogo-default-light.svg"
      alt="logo"
      width={width}
      height={height}
    />
  );
};
