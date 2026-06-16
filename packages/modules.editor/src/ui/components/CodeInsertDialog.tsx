import { useState } from 'react';
import { useInterfaceStore } from '../../store/interfaceStore';
import { useBlockMenuActions } from '../../hooks/useBlockMenuActions';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { useYjsContext } from '../../hooks';
import { common } from 'lowlight';

export const InsertCodeModal = () => {
  const { activeModal, closeModal } = useInterfaceStore();
  const { editor } = useYjsContext();

  const { insertCode } = useBlockMenuActions(editor);

  const [code, setCode] = useState('');
  const [lang, setLang] = useState('plaintext');
  const isOpen = activeModal === 'insertCode';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    insertCode(code, lang);

    setCode('');
    closeModal();
  };

  const availableLanguages = Object.keys(common);

  return (
    <Modal open={isOpen} onOpenChange={closeModal}>
      <ModalContent aria-describedby={undefined} className="max-w-md rounded-3xl p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ModalTitle className="flex gap-1">
            <div className="mt-1 flex justify-start gap-2">
              <Button
                size="s"
                type="button"
                variant="ghost"
                className="h-[26px] px-3 text-[14px]"
                onClick={closeModal}
              >
                Отмена
              </Button>
              <Button
                size="s"
                type="submit"
                variant="default"
                className="h-[26px] px-3 text-[14px]"
              >
                Добавить
              </Button>
            </div>
          </ModalTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-50">Выбрать язык:</span>
            <select
              value={lang}
              onChange={(e) => {
                if (e.target.value) setLang(e.target.value);
              }}
              className="border-gray-10 focus:border-gray-30 h-7 rounded border bg-white px-2 text-xs outline-none"
            >
              {availableLanguages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Вставьте код сюда..."
              rows={8}
              className="border-gray-10 placeholder-gray-40 focus:border-gray-30 w-full resize-none rounded-xl border p-3 font-mono text-sm focus:outline-none"
            />
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};
