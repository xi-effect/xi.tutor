import { useLayoutEffect, useRef, useState } from 'react';
import { useEditor, renderPlaintextFromRichText, type DrRichText } from '@ibodr/draw';
import { fitFontSizeFor } from '../utils/fitFontSize';
import {
  LABEL_FONT_SIZE,
  LABEL_LINE_HEIGHT,
  MIN_FONT_SIZE_RATIO,
  FONT_FIT_MIN_FONT_SIZE_PX,
} from '../consts';

export const useFaceFitFontSize = (
  editor: ReturnType<typeof useEditor>,
  richText: DrRichText,
  cardScale: number,
  availableHeight: number,
  contentWidth: number,
) => {
  const ghostRef = useRef<HTMLDivElement>(null);
  const [fitFontSize, setFitFontSize] = useState(LABEL_FONT_SIZE * cardScale);
  const plainText = renderPlaintextFromRichText(editor, richText);

  useLayoutEffect(() => {
    const el = ghostRef.current;
    if (!el) return;

    const maxFontSize = LABEL_FONT_SIZE * cardScale;
    const minFontSize = Math.max(FONT_FIT_MIN_FONT_SIZE_PX, maxFontSize * MIN_FONT_SIZE_RATIO);

    setFitFontSize(
      fitFontSizeFor(
        el,
        plainText,
        contentWidth,
        maxFontSize,
        minFontSize,
        LABEL_LINE_HEIGHT,
        availableHeight,
      ),
    );
  }, [plainText, cardScale, availableHeight, contentWidth]);

  return { ghostRef, fitFontSize, plainText };
};
