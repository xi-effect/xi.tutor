import { useState, useEffect } from 'react';

const STORAGE_KEY = 'classrooms-note-hidden';

export const useNoteVisibility = () => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem(STORAGE_KEY) === 'true';
    setIsHidden(hidden);
  }, []);

  const hideNote = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsHidden(true);
  };

  return { isHidden, hideNote };
};
