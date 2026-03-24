import { useEffect, useCallback, useMemo } from 'react';
import { Participant, RoomEvent } from 'livekit-client';
import { useParams, useSearch } from '@tanstack/react-router';

import { useRoom } from '../providers/RoomProvider';
import { useCallStore } from '../store/callStore';
import { useCurrentUser, useUpdateParticipantMetadata } from 'common.services';

export const useRaisedHands = () => {
  const { callId: paramsCallId } = useParams({ strict: false });
  const { call: searchCallId } = useSearch({ strict: false });

  const callId = paramsCallId ?? searchCallId;
  const { room } = useRoom();
  const { data: user } = useCurrentUser();

  const { addRaisedHand, removeRaisedHand } = useCallStore();

  const { updateParticipantMetadata } = useUpdateParticipantMetadata(user.default_layout);

  const isHandRaised = useMemo(() => {
    try {
      const parsed = JSON.parse(room?.localParticipant?.metadata ?? '{}');
      return !!parsed.is_hand_raised;
    } catch {
      return false;
    }
  }, [room?.localParticipant?.metadata]);

  const toggleHand = useCallback(async () => {
    if (!room?.localParticipant || !callId) return;

    try {
      await updateParticipantMetadata.mutate({
        classroom_id: callId,
        is_hand_raised: !isHandRaised,
      });
    } catch (e) {
      console.error('raise hand error', e);
    }
  }, [room, callId, isHandRaised, updateParticipantMetadata]);

  useEffect(() => {
    if (!room) return;

    const syncParticipant = (participant: Participant) => {
      try {
        const parsed = JSON.parse(participant.metadata || '{}');

        if (!('is_hand_raised' in parsed)) return;

        if (parsed.is_hand_raised) {
          addRaisedHand({
            participantId: participant.identity,
            participantName: participant.name ?? participant.identity,
            timestamp: Date.now(),
          });
        } else {
          removeRaisedHand(participant.identity);
        }
      } catch (e) {
        console.error('metadata parse error', e);
      }
    };

    const handler = (_metadata: string | undefined, participant: Participant) => {
      syncParticipant(participant);
    };

    room.on(RoomEvent.ParticipantMetadataChanged, handler);

    syncParticipant(room.localParticipant);
    room.remoteParticipants.forEach(syncParticipant);

    return () => {
      room.off(RoomEvent.ParticipantMetadataChanged, handler);
    };
  }, [room, addRaisedHand, removeRaisedHand]);

  return {
    toggleHand,
    isHandRaised,
    isPending: updateParticipantMetadata.isPending,
  };
};
