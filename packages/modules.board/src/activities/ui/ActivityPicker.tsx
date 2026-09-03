import { useEffect, useRef, useState } from 'react';
import { useEditor } from '@ibodr/draw';
import { Badge } from '@xipkg/badge';
import { Button } from '@xipkg/button';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import { cn } from '@xipkg/utils';
import { modalTitleClass } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { ACTIVITY_KINDS, type ActivityKind } from '../model/kinds';
import { insertActivity } from '../shape/insertActivity';
import { ACTIVITY_KIND_ICONS } from './activityKindIcons';
import { ActivityMotionItem, ActivityMotionList } from './activityUiMotion';
import { insertFlipCardShape } from '../../shapes/flipCard';

const PORTAL_Z = 9999;

/** Same beta chip as theme options in modules.profile customization. */
const betaBadgeClassName =
  'bg-action-primary-background-default text-action-primary-text inline-flex h-4 shrink-0 items-center rounded-full px-1.5 py-0 text-[8px] leading-none font-semibold uppercase';

export function ActivityPicker({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    const el = document.createElement('div');
    el.style.position = 'relative';
    el.style.zIndex = String(PORTAL_Z);
    document.body.appendChild(el);
    containerRef.current = el;
    setPortalReady(true);
    return () => {
      document.body.removeChild(el);
      containerRef.current = null;
    };
  }, []);

  const addKind = (kind: ActivityKind) => {
    if (kind === 'flip-card') {
      insertFlipCardShape(editor);
      onOpenChange(false);
      return;
    }
    insertActivity(editor, kind);
    onOpenChange(false);
  };

  if (!portalReady) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className="max-w-4xl"
        portalProps={{ container: containerRef.current ?? undefined }}
        aria-describedby={undefined}
      >
        <ModalHeader>
          <ModalCloseButton />
          <div className="flex max-w-[calc(100%-48px)] items-center gap-2">
            <ModalTitle className={modalTitleClass}>{t('activity.picker.title')}</ModalTitle>
            <Badge variant="default" className={betaBadgeClassName}>
              {t('activity.picker.beta')}
            </Badge>
          </div>
        </ModalHeader>
        <ModalBody className="max-h-[min(72dvh,40rem)] overflow-y-auto">
          <ActivityMotionList className="grid gap-3 sm:grid-cols-2">
            {ACTIVITY_KINDS.map((kind) => {
              const Icon = ACTIVITY_KIND_ICONS[kind];
              return (
                <ActivityMotionItem key={kind}>
                  <Button
                    type="button"
                    variant="none"
                    className={cn(
                      'border-border-default hover:bg-status-info-background h-auto w-full items-start justify-start gap-3 rounded-xl border p-3 text-left whitespace-normal',
                    )}
                    onClick={() => addKind(kind)}
                  >
                    <span className="bg-background-subtle text-icon-primary flex size-12 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="size-7" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-text-primary text-lg leading-snug font-semibold">
                        {t(`activity.kinds.${kind}`)}
                      </span>
                      <span className="text-text-secondary text-base leading-snug">
                        {t(`activity.catalog.${kind}.description`)}
                      </span>
                      <span className="text-text-muted text-sm leading-snug">
                        {t(`activity.catalog.${kind}.mechanics`)}
                      </span>
                    </span>
                  </Button>
                </ActivityMotionItem>
              );
            })}
          </ActivityMotionList>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
