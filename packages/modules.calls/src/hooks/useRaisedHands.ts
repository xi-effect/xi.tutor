import { useCallback } from 'react';
import { useRoom } from '../providers/RoomProvider';
import { useCurrentUser, useUpdateParticipantMetadata } from 'common.services';
import { useParams } from '@tanstack/react-router';
import { useParticipantInfo } from '@livekit/components-react';

export const useRaisedHands = () => {
  const { callId } = useParams({ strict: false });
  const { room } = useRoom();
  const { data: user } = useCurrentUser();
  const participant = room?.localParticipant;

  const { metadata } = useParticipantInfo({ participant });
  const isHandRaised = JSON.parse(metadata || '{}').is_hand_raised;

  const { updateParticipantMetadata } = useUpdateParticipantMetadata(user.default_layout);

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

  return {
    isHandRaised,
    toggleHand,
    isPending: updateParticipantMetadata.isPending,
  };
};
