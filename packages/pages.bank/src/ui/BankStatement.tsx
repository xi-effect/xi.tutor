import type { BankSubject } from 'features.bank';
import { MathBankLatex } from './MathBankLatex';

type BankStatementProps = {
  text: string;
  subject?: BankSubject;
  className?: string;
};

export const BankStatement = ({ text, subject = 'mathematics', className }: BankStatementProps) => {
  if (subject === 'russian' || subject === 'english') {
    return <span className={className}>{text}</span>;
  }

  return <MathBankLatex text={text} className={className} />;
};
