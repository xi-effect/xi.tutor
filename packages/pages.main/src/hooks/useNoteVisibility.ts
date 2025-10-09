import { useState, useEffect } from 'react';

export const useNoteVisibility = (isTutor: boolean) => {
  const [isHidden, setIsHidden] = useState(false);

  const STORAGE_KEY = isTutor ? 'classrooms-note-tutor-hidden' : 'classrooms-note-student-hidden';

  useEffect(() => {
    const hidden = localStorage.getItem(STORAGE_KEY) === 'true';
    setIsHidden(hidden);
  }, [STORAGE_KEY]);

  const hideNote = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsHidden(true);
  };

  return { isHidden, hideNote };
};
