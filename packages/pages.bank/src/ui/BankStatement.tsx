import type { BankSubject } from 'features.math.bank';
import { MathBankLatex } from './MathBankLatex';

type BankStatementProps = {
  text: string;
  subject?: BankSubject;
  className?: string;
};

export const BankStatement = ({ text, subject = 'mathematics', className }: BankStatementProps) => {
  if (subject === 'russian') {
    return <span className={className}>{text}</span>;
  }

  return <MathBankLatex text={text} className={className} />;
};
