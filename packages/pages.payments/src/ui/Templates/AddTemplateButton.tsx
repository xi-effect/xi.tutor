import { useState } from 'react';
import { Add } from '@xipkg/icons';
import { ModalTemplate } from './ModalTemplate';

export const AddTemplateButton = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddTemplate = () => {
    setModalOpen(true);
  };

  return (
    <>
      <div
        onClick={handleAddTemplate}
        className="hover:bg-background-page border-border-control bg-background-surface flex min-h-[97px] cursor-pointer flex-row items-center justify-between rounded-2xl border p-4 max-[960px]:hidden"
      >
        <span className="text-l-base text-text-primary">Создать</span>
        <Add className="fill-icon-primary" />
      </div>
      <ModalTemplate isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
