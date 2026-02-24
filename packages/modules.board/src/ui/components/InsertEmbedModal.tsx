import { useEffect, useState } from 'react';
import { Button } from '@xipkg/button';
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import { Close } from '@xipkg/icons';
import { Editor } from 'tldraw';
import { insertEmbed } from '../../features/insertEmbed';

type InsertEmbedModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: Editor | null;
};

export const InsertEmbedModal = ({ open, onOpenChange, editor }: InsertEmbedModalProps) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setValue('');
      setError(false);
    }
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setValue('');
      setError(false);
    }
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    const trimmed = value.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    const success = insertEmbed(editor, trimmed);
    if (success) {
      handleOpenChange(false);
      requestAnimationFrame(() => {
        editor.getContainer()?.focus?.();
      });
    } else {
      setError(true);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="max-w-[520px]" aria-describedby={undefined}>
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0" />
        </ModalCloseButton>
        <ModalHeader className="border-gray-20 border-b">
          <ModalTitle className="text-xl font-semibold text-gray-100">
            Вставить ссылку или iframe
          </ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <div className="border-gray-20 px-4 py-4">
            <label htmlFor="embed-input" className="text-gray-80 mb-2 block text-sm font-medium">
              Ссылка или HTML-код iframe
            </label>
            <textarea
              id="embed-input"
              rows={4}
              placeholder='https://example.com или вставьте код вида <iframe src="..." ...></iframe> (например, из YouTube: Поделиться → Встроить)'
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(false);
              }}
              className="border-gray-20 focus:border-brand-50 focus:ring-brand-50 w-full resize-y rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2"
              style={{ minHeight: 100 }}
            />
            {error && (
              <p className="text-negative-50 mt-1.5 text-xs">
                Введите корректный URL или HTML-код iframe с допустимым src (https://...).
              </p>
            )}
          </div>

          <ModalFooter className="border-gray-20 flex gap-2 border-t px-4 py-3">
            <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Вставить</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
