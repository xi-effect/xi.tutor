import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@xipkg/drawer';
import { ArrowLeft } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

export const boardDrawerRowClass =
  'border-border-default bg-background-surface hover:bg-background-page text-m-base text-text-primary flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left font-medium transition-colors';

type BoardDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
  contentClassName?: string;
  hideTitle?: boolean;
  fill?: boolean;
};

export const BoardDrawer = ({
  open,
  onOpenChange,
  title,
  onBack,
  children,
  contentClassName,
  hideTitle = false,
  fill = false,
}: BoardDrawerProps) => {
  const { t } = useTranslation('board');

  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal>
      <DrawerContent
        data-board-drawer
        className={cn(
          'z-50 max-h-[85dvh] w-full',
          fill && 'h-[85dvh] min-h-0 overflow-hidden',
          contentClassName,
        )}
      >
        <div className={cn('flex min-h-0 flex-col gap-3 pb-6', fill && 'h-full')}>
          {hideTitle && !onBack ? (
            <>
              <DrawerTitle className="sr-only">{title}</DrawerTitle>
              <DrawerDescription className="sr-only">{title}</DrawerDescription>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="hover:bg-background-page flex size-8 shrink-0 items-center justify-center rounded-lg"
                  aria-label={t('menu.back')}
                >
                  <ArrowLeft className="fill-icon-primary size-5" />
                </button>
              ) : null}
              <DrawerTitle
                className={cn(
                  'text-m-base text-text-primary min-w-0 flex-1 font-medium',
                  hideTitle && 'sr-only',
                )}
              >
                {title}
              </DrawerTitle>
              <DrawerDescription className="sr-only">{title}</DrawerDescription>
            </div>
          )}
          <div
            className={cn(
              'min-h-0 overflow-y-auto',
              fill && 'flex flex-1 flex-col overflow-hidden',
            )}
          >
            {children}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
