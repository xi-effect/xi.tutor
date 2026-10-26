import katex from 'katex';
import { useEffect, useRef } from 'react';
import { cn } from '@xipkg/utils';

type RichTextProps = {
  html: string;
  className?: string;
};

export const RichText = ({ html, className }: RichTextProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>('[data-latex]').forEach((element) => {
      const latex = element.getAttribute('data-latex') ?? '';
      element.innerHTML = '';
      katex.render(latex, element, {
        throwOnError: false,
        displayMode: element.getAttribute('data-type') === 'block-math',
      });
    });
  }, [html]);

  return (
    <div
      ref={ref}
      className={cn('homework-rich text-text-primary text-sm leading-5', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
