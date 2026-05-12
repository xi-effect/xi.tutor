import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type DayLessonListMetaContextValue = {
  showLessonDescription: boolean;
  toggleLessonDescription: () => void;
};

const DayLessonListMetaContext = createContext<DayLessonListMetaContextValue | null>(null);

/** Общий режим «мета / описание» для списка DayLessonRow в одном виджете */
export const DayLessonListMetaProvider = ({ children }: { children: ReactNode }) => {
  const [showLessonDescription, setShowLessonDescription] = useState(false);
  const toggleLessonDescription = useCallback(() => {
    setShowLessonDescription((v) => !v);
  }, []);
  const value = useMemo(
    () => ({ showLessonDescription, toggleLessonDescription }),
    [showLessonDescription, toggleLessonDescription],
  );
  return (
    <DayLessonListMetaContext.Provider value={value}>{children}</DayLessonListMetaContext.Provider>
  );
};

export function useDayLessonListMeta() {
  return useContext(DayLessonListMetaContext);
}
