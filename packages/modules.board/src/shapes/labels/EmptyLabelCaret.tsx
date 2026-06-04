import type { CSSProperties, PointerEvent } from 'react';

type EmptyLabelCaretProps = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  labelColor: string;
  textAlign: string;
  verticalAlign: string;
  padding?: number;
  style?: CSSProperties;
  onActivate?: () => void;
};

export const EmptyLabelCaret = ({
  fontFamily,
  fontSize,
  lineHeight,
  labelColor,
  textAlign,
  verticalAlign,
  padding = 0,
  style,
  onActivate,
}: EmptyLabelCaretProps) => {
  const justifyContent =
    textAlign === 'center' ? 'center' : textAlign === 'end' ? 'flex-end' : 'flex-start';
  const alignItems =
    verticalAlign === 'middle' ? 'center' : verticalAlign === 'end' ? 'flex-end' : 'flex-start';

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onActivate?.();
  };

  return (
    <div
      className="dr-text-label tl-text-wrapper dr-empty-label-caret pointer-events-none"
      data-hastext={false}
      data-isediting={false}
      data-isselected={true}
      style={{
        fontFamily,
        textAlign: textAlign as CSSProperties['textAlign'],
        justifyContent,
        alignItems,
        padding,
        ...style,
      }}
    >
      <div
        className="dr-text-label__inner tl-text-content__wrapper pointer-events-auto cursor-text"
        style={{
          fontSize,
          lineHeight: String(lineHeight),
          minHeight: `${Math.floor(fontSize * lineHeight)}px`,
          color: labelColor,
        }}
        onPointerDown={handlePointerDown}
      >
        <span className="dr-empty-label-caret__bar" aria-hidden />
      </div>
    </div>
  );
};
