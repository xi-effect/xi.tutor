import { useEditor } from '@ibodr/draw';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { ACTIVITY_KINDS, type ActivityKind } from '../model/kinds';
import { insertActivity } from '../shape/insertActivity';

const rowClass = cn(
  'bg-transparent hover:bg-background-page text-text-primary flex w-full items-center rounded-lg px-2 py-1.5 text-left text-sm font-medium transition-colors',
);

export function ActivityPicker({
  className,
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const { t } = useTranslation('board');
  const editor = useEditor();

  return (
    <div
      className={cn(
        'border-border-default bg-background-surface flex w-70 max-w-[calc(100vw-3rem)] flex-col gap-0.5 rounded-xl border p-1 shadow-none',
        className,
      )}
    >
      {ACTIVITY_KINDS.map((kind: ActivityKind) => (
        <button
          key={kind}
          type="button"
          className={rowClass}
          onClick={() => {
            insertActivity(editor, kind);
            onClose?.();
          }}
        >
          {t(`activity.kinds.${kind}`)}
        </button>
      ))}
    </div>
  );
}
