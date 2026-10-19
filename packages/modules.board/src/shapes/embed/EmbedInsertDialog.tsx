import { KeyboardEvent, RefObject, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Editor, createShapeId, useEditor } from '@ibodr/draw';
import { Button } from '@xipkg/button';
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
import { EMBED_PROVIDER_LABELS, parseEmbedInput } from './embedProviders';
import { EMBED_MIN_HEIGHT, EMBED_MIN_WIDTH, PORTAL_Z } from './consts';
import type { ResolvedEmbed } from './types';

export function insertEmbed(editor: Editor, embed: ResolvedEmbed) {
  const vb = editor.getViewportPageBounds();
  const scale = Math.min(1, (vb.w * 0.8) / embed.w, (vb.h * 0.8) / embed.h);
  const w = Math.max(EMBED_MIN_WIDTH, Math.round(embed.w * scale));
  const h = Math.max(EMBED_MIN_HEIGHT, Math.round(embed.h * scale));
  const c = vb.center;
  const id = createShapeId();

  editor.createShape({
    id,
    type: 'embed',
    x: c.x - w / 2,
    y: c.y - h / 2,
    props: { url: embed.src, w, h },
  });
  editor.select(id);
  editor.setCurrentTool('select');
}

type DialogProps = { open: boolean; onOpenChange: (open: boolean) => void };

export const EmbedInsertDialog = ({ open, onOpenChange }: DialogProps) => {
  const { t } = useTranslation('board');
  const descId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
        className="max-w-lg"
        portalProps={{ container: containerRef.current ?? undefined }}
        aria-describedby={descId}
        onOpenAutoFocus={(e: Event) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle className={modalTitleClass}>{t('embed.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <EmbedForm descId={descId} inputRef={inputRef} onClose={() => onOpenChange(false)} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

type FormProps = {
  descId: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
};

const EmbedForm = ({ descId, inputRef, onClose }: FormProps) => {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const errId = useId();
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const result = useMemo(() => (value.trim() ? parseEmbedInput(value) : null), [value]);
  const showError = touched && !!result && !result.ok;

  const submit = () => {
    setTouched(true);
    if (!result || !result.ok) {
      inputRef.current?.focus();
      return;
    }
    insertEmbed(editor, result.embed);
    onClose();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p id={descId} className="text-text-secondary text-sm">
        {t('embed.hint')}
      </p>

      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        onKeyDown={onKeyDown}
        rows={4}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        placeholder={t('embed.placeholder')}
        aria-invalid={showError}
        aria-describedby={showError ? errId : undefined}
        className="border-border-default bg-background-surface text-text-primary w-full resize-none rounded-lg border p-2 font-mono text-sm outline-none"
      />

      <div className="min-h-5 text-sm" aria-live="polite">
        {result?.ok && (
          <span className="text-green-100">
            {t('embed.detected', { provider: result.embed.label })}
          </span>
        )}
        {showError && result && !result.ok && (
          <span id={errId} role="alert" className="text-red-100">
            {t(`embed.errors.${result.error}`)}
          </span>
        )}
      </div>

      <p className="text-text-disabled text-xs">
        {t('embed.supported')}: {EMBED_PROVIDER_LABELS.join(', ')}
      </p>

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="none" onClick={onClose} className="h-11">
          {t('embed.cancel')}
        </Button>
        <Button onClick={submit} disabled={!result?.ok} className="h-11">
          {t('embed.insert')}
        </Button>
      </div>
    </div>
  );
};
