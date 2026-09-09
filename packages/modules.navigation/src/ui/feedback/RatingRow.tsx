import { cn } from '@xipkg/utils';
import type { ProductAnalyticsFeedbackScore } from 'common.utils';

const SCORES: ProductAnalyticsFeedbackScore[] = [1, 2, 3, 4, 5];

type RatingRowProps = {
  label: string;
  value: ProductAnalyticsFeedbackScore | null;
  onChange: (value: ProductAnalyticsFeedbackScore) => void;
};

export const RatingRow = ({ label, value, onChange }: RatingRowProps) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-s-base text-text-primary font-medium">{label}</p>
      <div className="flex gap-2" role="group" aria-label={label}>
        {SCORES.map((score) => {
          const selected = value === score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              aria-pressed={selected}
              className={cn(
                'text-s-base h-10 w-10 rounded-xl font-medium transition-colors',
                selected
                  ? 'bg-brand-80 text-gray-100'
                  : 'bg-background-page text-text-primary hover:bg-background-subtle',
              )}
            >
              {score}
            </button>
          );
        })}
      </div>
    </div>
  );
};
