import { splitMathText } from '../utils/latex';
import { renderLatexHtml } from '../utils/renderLatex';

type MathBankLatexProps = {
  text: string;
  className?: string;
};

export const MathBankLatex = ({ text, className }: MathBankLatexProps) => {
  const parts = splitMathText(text);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={`${part.type}-${index}`}>{part.value}</span>;
        }

        return (
          <span
            key={`${part.type}-${index}`}
            className={part.display ? 'my-2 block overflow-x-auto' : 'inline'}
            dangerouslySetInnerHTML={{ __html: renderLatexHtml(part.value, part.display) }}
          />
        );
      })}
    </span>
  );
};
