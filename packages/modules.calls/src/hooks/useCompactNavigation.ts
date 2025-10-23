import { useMemo, useState, useEffect } from 'react';
import { Track } from 'livekit-client';
import type { TrackReference } from '@livekit/components-core';
import { useRoom } from '../providers/RoomProvider';

export const useCompactNavigation = () => {
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const { room } = useRoom();

  // Получаем всех участников комнаты (включая локального, без камеры и демонстрацию экрана)
  const participants = useMemo(() => {
    if (!room) return [];

    // Получаем всех участников: локального + удаленных
    const allParticipants = [
      room.localParticipant,
      ...Array.from(room.remoteParticipants.values()),
    ];

    // Собираем все треки (камера + демонстрация экрана) для каждого участника
    const allTracks: TrackReference[] = [];

    allParticipants.forEach((participant) => {
      const videoTracks = [...participant.videoTrackPublications.values()];

      // Ищем трек камеры
      const cameraTrack = videoTracks.find(
        (track) => track.source === Track.Source.Camera && track.isSubscribed,
      );

      // Ищем трек демонстрации экрана
      const screenShareTrack = videoTracks.find(
        (track) => track.source === Track.Source.ScreenShare && track.isSubscribed,
      );

      // Добавляем трек камеры, если есть
      if (cameraTrack) {
        allTracks.push({
          participant,
          source: Track.Source.Camera,
          publication: cameraTrack,
        } as TrackReference);
      }

      // Добавляем трек демонстрации экрана, если есть
      if (screenShareTrack) {
        allTracks.push({
          participant,
          source: Track.Source.ScreenShare,
          publication: screenShareTrack,
        } as TrackReference);
      }

      // Если нет ни камеры, ни демонстрации экрана, добавляем placeholder
      if (!cameraTrack && !screenShareTrack) {
        allTracks.push({
          participant,
          source: Track.Source.Camera,
          publication: undefined,
        } as unknown as TrackReference);
      }
    });

    return allTracks;
  }, [room]);

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

  // Обновляем участников при изменении комнаты
  useEffect(() => {
    if (room) {
      const handleParticipantConnected = () => {
        // Принудительно обновляем список участников
        setCurrentParticipantIndex(0);
      };

      const handleParticipantDisconnected = () => {
        // Принудительно обновляем список участников
        setCurrentParticipantIndex(0);
      };

      const handleTrackPublished = () => {
        // Обновляем при публикации трека (включая демонстрацию экрана)
        setCurrentParticipantIndex(0);
      };

      const handleTrackUnpublished = () => {
        // Обновляем при отмене публикации трека
        setCurrentParticipantIndex(0);
      };

      room.on('participantConnected', handleParticipantConnected);
      room.on('participantDisconnected', handleParticipantDisconnected);
      room.on('trackPublished', handleTrackPublished);
      room.on('trackUnpublished', handleTrackUnpublished);

      return () => {
        room.off('participantConnected', handleParticipantConnected);
        room.off('participantDisconnected', handleParticipantDisconnected);
        room.off('trackPublished', handleTrackPublished);
        room.off('trackUnpublished', handleTrackUnpublished);
      };
    }
  }, [room]);

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
