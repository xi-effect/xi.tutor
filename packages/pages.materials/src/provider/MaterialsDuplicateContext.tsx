import { createContext, useContext, useState, ReactNode } from 'react';

type MaterialsDuplicateContextType = {
  materialId: number | null;
  open: boolean;
  openModal: (materialId: number) => void;
  closeModal: () => void;
};

const MaterialsDuplicateContext = createContext<MaterialsDuplicateContextType | undefined>(
  undefined,
);

export const MaterialsDuplicateProvider = ({ children }: { children: ReactNode }) => {
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const openModal = (id: number) => {
    setMaterialId(id);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    // Очищаем materialId после закрытия модалки (небольшая задержка для плавности)
    setTimeout(() => {
      setMaterialId(null);
    }, 200);
  };

  return (
    <MaterialsDuplicateContext.Provider value={{ materialId, open, openModal, closeModal }}>
      {children}
    </MaterialsDuplicateContext.Provider>
  );
};

export const useMaterialsDuplicate = () => {
  const context = useContext(MaterialsDuplicateContext);
  if (context === undefined) {
    throw new Error('useMaterialsDuplicate must be used within a MaterialsDuplicateProvider');
  }
  return context;
};
