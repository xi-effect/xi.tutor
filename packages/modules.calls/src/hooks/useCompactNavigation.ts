import { useState, useEffect } from 'react';
import { Track } from 'livekit-client';
import { useTracks } from '@livekit/components-react';
import { useScreenShareCleanup } from './useScreenShareCleanup';

export const useCompactNavigation = () => {
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);

  // Получаем треки через useTracks (как в VideoGrid) для автоматического обновления
  const participants = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    {
      onlySubscribed: false, // Получаем все треки, включая неподписанные для корректного подсчета участников
    },
  );

  // Автоматическое удаление треков демонстрации экрана при их завершении
  useScreenShareCleanup(participants);

  const currentParticipant = participants[currentParticipantIndex] || null;
  const totalParticipants = participants.length;

  const canGoNext = currentParticipantIndex < totalParticipants - 1;
  const canGoPrev = currentParticipantIndex > 0;

  const goToNext = () => {
    if (canGoNext) {
      setCurrentParticipantIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (canGoPrev) {
      setCurrentParticipantIndex((prev) => prev - 1);
    }
  };

  const goToParticipant = (index: number) => {
    if (index >= 0 && index < totalParticipants) {
      setCurrentParticipantIndex(index);
    }
  };

  // Сброс индекса при изменении количества участников
  useEffect(() => {
    if (currentParticipantIndex >= totalParticipants && totalParticipants > 0) {
      setCurrentParticipantIndex(Math.max(0, totalParticipants - 1));
    }
  }, [totalParticipants, currentParticipantIndex]);

  // useTracks автоматически обновляется при изменениях треков,
  // поэтому дополнительные обработчики событий не нужны

  return {
    currentParticipant,
    participants,
    currentIndex: currentParticipantIndex,
    totalParticipants,
    canGoNext,
    canGoPrev,
    goToNext,
    goToPrev,
    goToParticipant,
  };
};
