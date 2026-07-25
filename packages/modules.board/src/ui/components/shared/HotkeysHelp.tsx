import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import { modalTitleClass } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { isMac } from '../../../utils';

const PORTAL_Z = 9999;

interface HotkeyItem {
  keys: string[];
  description: string;
  category: string;
}

const modKey = isMac ? '⌘' : 'Ctrl';

const groupByCategory = (items: HotkeyItem[]) => {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, HotkeyItem[]>,
  );
};

const HotkeysHelpBody = () => {
  const { t } = useTranslation('board');

  const groupedHotkeys = useMemo(() => {
    const hotkeyCategories: HotkeyItem[] = [
      {
        keys: ['V'],
        description: t('hotkeys.selectTool'),
        category: t('hotkeys.categories.tools'),
      },
      { keys: ['H'], description: t('hotkeys.handTool'), category: t('hotkeys.categories.tools') },
      { keys: ['P'], description: t('hotkeys.pen'), category: t('hotkeys.categories.tools') },
      { keys: ['T'], description: t('hotkeys.text'), category: t('hotkeys.categories.tools') },
      { keys: ['G'], description: t('hotkeys.shapes'), category: t('hotkeys.categories.tools') },
      { keys: ['A'], description: t('hotkeys.arrow'), category: t('hotkeys.categories.tools') },
      { keys: ['E'], description: t('hotkeys.eraser'), category: t('hotkeys.categories.tools') },
      { keys: ['F'], description: t('hotkeys.frame'), category: t('hotkeys.categories.tools') },

      {
        keys: [modKey, 'A'],
        description: t('hotkeys.selectAll'),
        category: t('hotkeys.categories.actions'),
      },
      {
        keys: ['Escape'],
        description: t('hotkeys.deselect'),
        category: t('hotkeys.categories.actions'),
      },
      {
        keys: [modKey, 'D'],
        description: t('hotkeys.duplicate'),
        category: t('hotkeys.categories.actions'),
      },
      {
        keys: ['Backspace'],
        description: t('hotkeys.deleteSelected'),
        category: t('hotkeys.categories.actions'),
      },
      {
        keys: [modKey, 'C'],
        description: t('hotkeys.copy'),
        category: t('hotkeys.categories.actions'),
      },
      {
        keys: ['Delete'],
        description: t('hotkeys.deleteSelected'),
        category: t('hotkeys.categories.actions'),
      },
      {
        keys: [modKey, 'V'],
        description: t('hotkeys.paste'),
        category: t('hotkeys.categories.actions'),
      },
      {
        keys: [modKey, 'Z'],
        description: t('hotkeys.undo'),
        category: t('hotkeys.categories.actions'),
      },
      {
        keys: [modKey, 'X'],
        description: t('hotkeys.cut'),
        category: t('hotkeys.categories.actions'),
      },
      {
        keys: [modKey, 'Y'],
        description: t('hotkeys.redo'),
        category: t('hotkeys.categories.actions'),
      },
      {
        keys: [modKey, 'G'],
        description: t('hotkeys.groupUngroup'),
        category: t('hotkeys.categories.actions'),
      },
      {
        keys: [modKey, 'L'],
        description: t('hotkeys.lockUnlock'),
        category: t('hotkeys.categories.actions'),
      },

      {
        keys: [modKey, '+'],
        description: t('hotkeys.zoomIn'),
        category: t('hotkeys.categories.zoom'),
      },
      {
        keys: [modKey, '-'],
        description: t('hotkeys.zoomOut'),
        category: t('hotkeys.categories.zoom'),
      },
      {
        keys: [modKey, '0'],
        description: t('hotkeys.zoomReset'),
        category: t('hotkeys.categories.zoom'),
      },
      {
        keys: [modKey, '1'],
        description: t('hotkeys.zoomFit'),
        category: t('hotkeys.categories.zoom'),
      },
    ];

    return groupByCategory(hotkeyCategories);
  }, [t]);

  return (
    <div className="space-y-6 p-6">
      {Object.entries(groupedHotkeys).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-text-primary mb-3 text-lg font-semibold">{category}</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-background-page flex items-center justify-between rounded-lg p-2"
              >
                <span className="text-text-primary text-sm">{item.description}</span>
                <div className="flex gap-1">
                  {item.keys.map((key, keyIndex) => (
                    <div key={keyIndex} className="flex items-center gap-1">
                      {keyIndex > 0 && <span className="text-text-secondary">+</span>}
                      <kbd className="border-border-default bg-background-surface text-text-primary rounded border px-2 py-1 font-mono text-xs shadow-sm">
                        {key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export type HotkeysHelpModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Портал модалки рендерится в отдельный контейнер с высоким z-index,
 * чтобы и overlay (backdrop + скролл), и контент были выше tldraw-канваса.
 * Overlay из @xipkg/modal сам обрабатывает клик снаружи и скролл.
 */
export const HotkeysHelpModal = ({ open, onOpenChange }: HotkeysHelpModalProps) => {
  const { t } = useTranslation('board');
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
          <ModalTitle className={modalTitleClass}>{t('hotkeys.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody style={{ maxHeight: 'calc(80dvh - 80px)', overflowY: 'auto', padding: 0 }}>
          <HotkeysHelpBody />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
