type CommentRegionBoxProps = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const CommentRegionBox = ({ left, top, width, height }: CommentRegionBoxProps) => (
  <div
    aria-hidden
    className="border-border-focus pointer-events-none absolute z-30 rounded-md border-2 border-dashed"
    style={{ left, top, width, height }}
  />
);
