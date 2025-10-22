import { useMemo, useState, useEffect } from 'react';
import { Track } from 'livekit-client';
import { useTracks } from '@livekit/components-react';
import { isTrackReference } from '@livekit/components-core';
import type { TrackReference } from '@livekit/components-core';

export const useCompactNavigation = () => {
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);

  // Получаем треки (может вернуть пустой массив если нет контекста)
  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }], {
    onlySubscribed: true,
  });

  // Фильтруем только реальные треки (не placeholder)
  const participants = useMemo(() => {
    return cameraTracks.filter(isTrackReference) as TrackReference[];
  }, [cameraTracks]);

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
