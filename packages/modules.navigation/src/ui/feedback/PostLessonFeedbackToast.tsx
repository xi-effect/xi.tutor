import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import { toast } from 'sonner';

type PostLessonFeedbackToastProps = {
  toastId: string | number;
  title: string;
  description: string;
  actionLabel: string;
  closeLabel: string;
  onRate: () => void;
  onDismiss: () => void;
};

export const PostLessonFeedbackToast = ({
  toastId,
  title,
  description,
  actionLabel,
  closeLabel,
  onRate,
  onDismiss,
}: PostLessonFeedbackToastProps) => {
  return (
    <div className="bg-background-surface border-border-default text-text-primary w-[min(360px,calc(100vw-32px))] rounded-2xl border p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <p className="text-m-base font-semibold">{title}</p>
        <button
          type="button"
          className="group flex size-6 shrink-0 items-center justify-center bg-transparent p-0"
          aria-label={closeLabel}
          onClick={() => {
            onDismiss();
            toast.dismiss(toastId);
          }}
        >
          <Close className="fill-icon-secondary group-hover:fill-icon-primary size-5" />
        </button>
      </div>
      <p className="text-s-base text-text-secondary mt-1.5 leading-snug">{description}</p>
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          size="s"
          className="h-8 rounded-xl px-3"
          onClick={() => {
            onRate();
            toast.dismiss(toastId);
          }}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
};
