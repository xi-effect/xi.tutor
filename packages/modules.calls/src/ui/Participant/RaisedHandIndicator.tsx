import { Hand } from '@xipkg/icons';
import { useParticipantInfo } from '@livekit/components-react';
import { Participant } from 'livekit-client';

type RaisedHandIndicatorProps = {
  participant: Participant;
  compact?: boolean; // Для компактного отображения в метаданных
};

export const RaisedHandIndicator = ({ participant, compact = false }: RaisedHandIndicatorProps) => {
  const { metadata } = useParticipantInfo({ participant });
  const isHandRaised = JSON.parse(metadata || '{}').is_hand_raised;

  if (!isHandRaised) return null;

  if (compact) {
    return (
      <div className="bg-brand-100 text-brand-0 flex h-5 w-5 items-center justify-center">
        <Hand className="h-3 w-3" />
      </div>
    );
  }

  return (
    <div className="bg-gray-0/80 text-brand-0 flex h-8 w-8 items-center justify-center rounded-2xl">
      <Hand className="h-4 w-4" />
    </div>
  );
};
