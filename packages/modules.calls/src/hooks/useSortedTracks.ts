import { useMemo, useRef } from 'react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { Track } from 'livekit-client';
import { useCallStore } from '../store/callStore';
import { useRoom } from '../providers/RoomProvider';

const SPEAKER_STICKY_MS = 10_000;

function getParticipantIds(participant: { identity: string; metadata?: string }): string[] {
  const ids = [participant.identity];
  if (participant.metadata) {
    try {
      const meta = JSON.parse(participant.metadata);
      if (meta?.user_id) ids.push(meta.user_id);
      if (meta?.id) ids.push(meta.id);
    } catch {
      /* metadata is not JSON */
    }
  }
  return ids;
}

/**
 * Сортирует треки участников по приоритету:
 *   1. Демонстрация экрана
 *   2. Поднятая рука (более раннее время → выше)
 *   3. Активно говорящий
 *   4. Недавно говоривший (sticky-окно SPEAKER_STICKY_MS)
 *   5. Остальные (стабильный порядок)
 */
export function useSortedTracks(
  tracks: TrackReferenceOrPlaceholder[],
): TrackReferenceOrPlaceholder[] {
  const raisedHands = useCallStore((state) => state.raisedHands);
  const { room } = useRoom();

  const recentSpeakersRef = useRef<Map<string, number>>(new Map());

  const activeSpeakers = room?.activeSpeakers ?? [];

  const now = Date.now();
  for (const speaker of activeSpeakers) {
    recentSpeakersRef.current.set(speaker.identity, now);
  }
  for (const [id, ts] of recentSpeakersRef.current) {
    if (now - ts > SPEAKER_STICKY_MS) {
      recentSpeakersRef.current.delete(id);
    }
  }

  return useMemo(() => {
    if (tracks.length <= 1) return tracks;

    const activeSpeakerIds = new Set(activeSpeakers.map((s) => s.identity));

    const raisedHandMap = new Map<string, number>();
    for (const hand of raisedHands) {
      raisedHandMap.set(hand.participantId, hand.timestamp);
    }

    const recentSpeakers = recentSpeakersRef.current;

    const indexed = tracks.map((track, i) => ({ track, idx: i }));

    indexed.sort((a, b) => {
      const aIsScreen = a.track.source === Track.Source.ScreenShare;
      const bIsScreen = b.track.source === Track.Source.ScreenShare;

      if (aIsScreen !== bIsScreen) return aIsScreen ? -1 : 1;

      const aIds = getParticipantIds(a.track.participant);
      const bIds = getParticipantIds(b.track.participant);

      const aHandTs = aIds.reduce<number | undefined>(
        (acc, id) => acc ?? raisedHandMap.get(id),
        undefined,
      );
      const bHandTs = bIds.reduce<number | undefined>(
        (acc, id) => acc ?? raisedHandMap.get(id),
        undefined,
      );

      const aHasHand = aHandTs !== undefined;
      const bHasHand = bHandTs !== undefined;

      if (aHasHand !== bHasHand) return aHasHand ? -1 : 1;
      if (aHasHand && bHasHand) return aHandTs! - bHandTs!;

      const aIsSpeaking = activeSpeakerIds.has(a.track.participant.identity);
      const bIsSpeaking = activeSpeakerIds.has(b.track.participant.identity);

      if (aIsSpeaking !== bIsSpeaking) return aIsSpeaking ? -1 : 1;

      const aRecent = recentSpeakers.has(a.track.participant.identity);
      const bRecent = recentSpeakers.has(b.track.participant.identity);

      if (aRecent !== bRecent) return aRecent ? -1 : 1;

      return a.idx - b.idx;
    });

    return indexed.map(({ track }) => track);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, raisedHands, activeSpeakers]);
}
