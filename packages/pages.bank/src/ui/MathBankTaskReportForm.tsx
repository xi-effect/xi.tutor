import { useEffect, useId, useState, type FormEvent } from 'react';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import { modalCancelButtonClass, modalConfirmButtonClass } from 'common.ui';
import {
  FEEDBACK_COMMENT_MAX_LENGTH,
  prepareFeedbackComment,
  trackMathTaskReport,
} from 'common.utils';
import type { MathTaskSearchDocument } from 'features.math.bank';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { toMathBankTaskSnapshot } from '../utils/analytics';

type MathBankTaskReportFormProps = {
  task: MathTaskSearchDocument;
  onClose: () => void;
};

export const MathBankTaskReportForm = ({ task, onClose }: MathBankTaskReportFormProps) => {
  const { t } = useTranslation('mathBank');
  const fieldId = useId();
  const [comment, setComment] = useState('');

  useEffect(() => {
    setComment('');
  }, [task.id]);

  const canSubmit = Boolean(prepareFeedbackComment(comment));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const sent = trackMathTaskReport(toMathBankTaskSnapshot(task), comment, 'page');
    if (!sent) {
      return;
    }

    toast.success(t('task.reportSent'));
    setComment('');
    onClose();
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <label className="text-s-base text-text-primary font-medium" htmlFor={fieldId}>
          {t('task.reportLabel')}
        </label>
        <p className="text-xs-base text-text-secondary">{t('task.reportHint')}</p>
        <textarea
          id={fieldId}
          value={comment}
          maxLength={FEEDBACK_COMMENT_MAX_LENGTH}
          onChange={(event) => setComment(event.target.value)}
          placeholder={t('task.reportPlaceholder')}
          className={cn(
            'border-border-default placeholder:text-text-disabled text-text-primary min-h-24 w-full resize-y rounded-lg border bg-transparent px-3 py-2 text-sm outline-none',
            'focus-visible:border-border-focus',
          )}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="none" className={modalCancelButtonClass} onClick={onClose}>
          {t('task.reportCancel')}
        </Button>
        <Button type="submit" size="m" className={modalConfirmButtonClass} disabled={!canSubmit}>
          {t('task.reportSubmit')}
        </Button>
      </div>
    </form>
  );
};
