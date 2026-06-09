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
        className="hover:bg-gray-5 border-gray-30 bg-gray-0 flex min-h-[97px] cursor-pointer flex-row items-center justify-between rounded-2xl border p-4 max-[960px]:hidden"
      >
        <span className="text-l-base text-gray-80">Создать</span>
        <Add className="fill-gray-80" />
      </div>
      <ModalTemplate isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
