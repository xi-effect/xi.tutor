import { Badge } from '@xipkg/badge';
import { Button } from '@xipkg/button';
import { toast } from 'sonner';

type MiroPasteToastProps = {
  title: string;
  betaLabel: string;
  description: string;
  imagesNote: string;
  dismissLabel: string;
  toastId: string | number;
  onDismissForever: () => void;
};

/** Same beta chip styling as modules.profile customization theme badge. */
const betaBadgeClassName =
  'bg-action-primary-background-default text-action-primary-text inline-flex h-4 items-center rounded-full px-1.5 py-0 text-[8px] leading-none font-semibold uppercase';

export const MiroPasteToast = ({
  title,
  betaLabel,
  description,
  imagesNote,
  dismissLabel,
  toastId,
  onDismissForever,
}: MiroPasteToastProps) => {
  return (
    <div className="bg-gray-0 border-gray-20 w-[min(380px,calc(100vw-32px))] rounded-2xl border p-4 text-gray-100 shadow-lg">
      <div className="flex items-center gap-2">
        <p className="text-m-base font-semibold">{title}</p>
        <Badge variant="default" className={betaBadgeClassName}>
          {betaLabel}
        </Badge>
      </div>
      <p className="text-s-base text-gray-80 mt-1.5 leading-snug">{description}</p>
      <p className="text-s-base text-gray-80 mt-2.5 leading-snug">{imagesNote}</p>
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="s"
          className="text-gray-80 h-8 px-2 text-xs font-medium hover:text-gray-100"
          onClick={() => {
            onDismissForever();
            toast.dismiss(toastId);
          }}
        >
          {dismissLabel}
        </Button>
      </div>
    </div>
  );
};
