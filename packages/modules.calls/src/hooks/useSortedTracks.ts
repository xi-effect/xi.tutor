import { useMemo, useRef } from 'react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { Track } from 'livekit-client';
import { useCallStore } from '../store/callStore';
import { useRoom } from '../providers/RoomProvider';

const SPEAKER_STICKY_MS = 10_000;

const PRIORITY_SCREEN_SHARE = 1;
const PRIORITY_RAISED_HAND = 2;
const PRIORITY_SPEAKING = 3;
const PRIORITY_RECENT_SPEAKER = 4;
const PRIORITY_NONE = 5;

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
 *
 * Если передан firstPageSize > 0, участники уже находящиеся
 * на первой странице (индексы 0..firstPageSize-1) сохраняют
 * свой порядок. Продвигаются только приоритетные участники
 * со страниц 2+.
 */
export function useSortedTracks(
  tracks: TrackReferenceOrPlaceholder[],
  firstPageSize: number = 0,
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

    const getHandTs = (track: TrackReferenceOrPlaceholder): number | undefined => {
      const ids = getParticipantIds(track.participant);
      return ids.reduce<number | undefined>((acc, id) => acc ?? raisedHandMap.get(id), undefined);
    };

    const getPriority = (track: TrackReferenceOrPlaceholder): number => {
      if (track.source === Track.Source.ScreenShare) return PRIORITY_SCREEN_SHARE;
      if (getHandTs(track) !== undefined) return PRIORITY_RAISED_HAND;
      if (activeSpeakerIds.has(track.participant.identity)) return PRIORITY_SPEAKING;
      if (recentSpeakers.has(track.participant.identity)) return PRIORITY_RECENT_SPEAKER;
      return PRIORITY_NONE;
    };

    const comparePriority = (
      a: TrackReferenceOrPlaceholder,
      b: TrackReferenceOrPlaceholder,
    ): number => {
      const pa = getPriority(a);
      const pb = getPriority(b);
      if (pa !== pb) return pa - pb;
      if (pa === PRIORITY_RAISED_HAND) {
        return (getHandTs(a) ?? 0) - (getHandTs(b) ?? 0);
      }
      return 0;
    };

    const clampedPageSize = Math.max(0, Math.min(firstPageSize, tracks.length));

    if (clampedPageSize >= tracks.length) return tracks;

    if (clampedPageSize === 0) {
      const indexed = tracks.map((track, i) => ({ track, idx: i }));
      indexed.sort((a, b) => comparePriority(a.track, b.track) || a.idx - b.idx);
      return indexed.map(({ track }) => track);
    }

    const firstPage = tracks.slice(0, clampedPageSize);
    const rest = tracks.slice(clampedPageSize);

    const priorityFromRest: TrackReferenceOrPlaceholder[] = [];
    const nonPriorityFromRest: TrackReferenceOrPlaceholder[] = [];

    for (const track of rest) {
      if (getPriority(track) < PRIORITY_NONE) {
        priorityFromRest.push(track);
      } else {
        nonPriorityFromRest.push(track);
      }
    }

    if (priorityFromRest.length === 0) return tracks;

    priorityFromRest.sort(comparePriority);

    return [...priorityFromRest, ...firstPage, ...nonPriorityFromRest];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, raisedHands, activeSpeakers, firstPageSize]);
}
