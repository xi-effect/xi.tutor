import katex from 'katex';
import 'katex/dist/katex.min.css';
import { splitMathText } from 'pages.bank/latex';
import { cn } from '@xipkg/utils';

const renderLatex = (latex: string, displayMode: boolean) => {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      output: 'html',
    });
  } catch {
    return latex;
  }
};

export function ExerciseText({ text, className }: { text: string; className?: string }) {
  const parts = splitMathText(text);

  return (
    <span className={cn('whitespace-pre-wrap', className)}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={`${part.type}-${index}`}>{part.value}</span>;
        }

        return (
          <span
            key={`${part.type}-${index}`}
            className={part.display ? 'my-2 block overflow-x-auto' : 'inline'}
            dangerouslySetInnerHTML={{ __html: renderLatex(part.value, part.display) }}
          />
        );
      })}
    </span>
  );
}
