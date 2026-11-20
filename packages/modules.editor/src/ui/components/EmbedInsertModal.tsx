import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
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
import { EMBED_PROVIDER_LABELS, parseEmbedInput } from 'modules.embed';
import { useYjsContext } from '../../hooks/useYjsContext';
import { useInterfaceStore } from '../../store/interfaceStore';
import { insertContentRelativeToBlock } from '../../utils/insertContentRelativeToBlock';

export const EmbedInsertModal = () => {
  const { t } = useTranslation('editor');
  const { activeModal, closeModal } = useInterfaceStore();
  const { editor } = useYjsContext();
  const descId = useId();
  const errId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const isOpen = activeModal === 'insertEmbed';
  const result = useMemo(() => (value.trim() ? parseEmbedInput(value) : null), [value]);
  const showError = touched && !!result && !result.ok;

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    setValue('');
    setTouched(false);
    closeModal();
  };

  const handleInsert = () => {
    if (!editor?.isEditable || !result?.ok) return;

    insertContentRelativeToBlock(editor, {
      type: 'embed',
      attrs: { src: result.embed.src },
    });
    handleOpenChange(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleInsert();
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalContent
        className="max-w-lg"
        aria-describedby={descId}
        onOpenAutoFocus={(event: Event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle className={modalTitleClass}>{t('embed.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2">
            <p id={descId} className="text-text-secondary text-sm">
              {t('embed.hint')}
            </p>
            <textarea
              ref={inputRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onBlur={() => setTouched(true)}
              onKeyDown={handleKeyDown}
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
              <Button variant="none" onClick={() => handleOpenChange(false)} className="h-11">
                {t('embed.cancel')}
              </Button>
              <Button
                disabled={!result?.ok || !editor?.isEditable}
                onClick={handleInsert}
                className="h-11"
              >
                {t('embed.insert')}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
