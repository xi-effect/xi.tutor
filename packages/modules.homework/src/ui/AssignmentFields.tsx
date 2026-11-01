import { Input } from '@xipkg/input';
import { Textarea } from '@xipkg/textarea';
import { Toggle } from '@xipkg/toggle';
import { useTranslation } from 'react-i18next';
import { HOMEWORK_DESCRIPTION_MAX, type HomeworkContent } from '../types';

type SettingsPatch = Partial<
  Pick<HomeworkContent, 'estimatedMinutes' | 'allowRetake' | 'showCorrectAnswers'>
>;

type AssignmentSettingsProps = {
  description: string;
  content: HomeworkContent;
  onDescription: (description: string) => void;
  onContent: (patch: SettingsPatch) => void;
};

export const AssignmentSettings = ({
  description,
  content,
  onDescription,
  onContent,
}: AssignmentSettingsProps) => {
  const { t } = useTranslation('homeworkEditor');

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-text-secondary flex justify-between text-xs">
          <span>{t('description')}</span>
          <span>
            {description.length}/{HOMEWORK_DESCRIPTION_MAX}
          </span>
        </span>
        <Textarea
          value={description}
          maxLength={HOMEWORK_DESCRIPTION_MAX}
          placeholder={t('descriptionPlaceholder')}
          rows={4}
          onChange={(event) => onDescription(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-text-secondary text-xs">{t('minutes')}</span>
        <Input
          type="number"
          min={1}
          max={600}
          value={content.estimatedMinutes ?? ''}
          onChange={(event) => {
            const raw = event.target.value;
            if (!raw) {
              onContent({ estimatedMinutes: null });
              return;
            }
            const parsed = Number(raw);
            if (!Number.isFinite(parsed)) return;
            onContent({ estimatedMinutes: Math.min(600, Math.max(1, Math.round(parsed))) });
          }}
        />
      </label>
      <label className="flex items-center justify-between gap-4">
        <span className="text-text-primary text-sm">{t('allowRetake')}</span>
        <Toggle
          checked={content.allowRetake}
          size="s"
          aria-label={t('allowRetake')}
          onCheckedChange={(checked) => onContent({ allowRetake: checked === true })}
        />
      </label>
      <label className="flex items-center justify-between gap-4">
        <span className="text-text-primary text-sm">{t('showCorrectAnswers')}</span>
        <Toggle
          checked={content.showCorrectAnswers}
          size="s"
          aria-label={t('showCorrectAnswers')}
          onCheckedChange={(checked) => onContent({ showCorrectAnswers: checked === true })}
        />
      </label>
    </div>
  );
};
