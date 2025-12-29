import { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { useEffect, useState } from 'react';

export const useEmptyItemContainerOfUser = (
  tracksLength: number,
  tracks: TrackReferenceOrPlaceholder[],
) => {
  const [isOneItem, setIsOneItem] = useState(false);

  useEffect(() => {
    // Подсчитываем уникальных участников (не треков)
    const uniqueParticipants = new Set(
      tracks
        .filter((track) => track.participant && track.participant.identity)
        .map((track) => track.participant.identity),
    );

    // Показываем placeholder если только один участник
    // Дополнительная проверка: если tracks пустой, но tracksLength > 0,
    // это может означать, что участники еще не загрузились
    const shouldShowPlaceholder =
      uniqueParticipants.size === 1 || (tracks.length === 0 && tracksLength > 0);

    setIsOneItem(shouldShowPlaceholder);
  }, [tracksLength, tracks]);

  return isOneItem;
};
