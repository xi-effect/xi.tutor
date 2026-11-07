import { createContext, useContext, useRef, useState, ReactNode } from 'react';

type MaterialDuplicateTarget = {
  id: string;
  name?: string;
  contentKind: 'note' | 'board';
  sourceClassroomId?: number | null;
};

type MaterialsDuplicateContextType = {
  target: MaterialDuplicateTarget | null;
  open: boolean;
  openModal: (target: MaterialDuplicateTarget) => void;
  closeModal: () => void;
};

const MaterialsDuplicateContext = createContext<MaterialsDuplicateContextType | undefined>(
  undefined,
);

export const MaterialsDuplicateProvider = ({ children }: { children: ReactNode }) => {
  const [target, setTarget] = useState<MaterialDuplicateTarget | null>(null);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openModal = (nextTarget: MaterialDuplicateTarget) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    setTarget(nextTarget);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);

    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    closeTimer.current = setTimeout(() => {
      setTarget(null);
      closeTimer.current = null;
    }, 200);
  };

  return (
    <MaterialsDuplicateContext.Provider value={{ target, open, openModal, closeModal }}>
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
