import { Hand } from '@xipkg/icons';
import { useCallStore } from '../../store/callStore';

type RaisedHandIndicatorProps = {
  participantId: string;
};

export const RaisedHandIndicator = ({ participantId }: RaisedHandIndicatorProps) => {
  const { raisedHands } = useCallStore();

  const isHandRaised = raisedHands.some((hand) => hand.participantId === participantId);

  if (!isHandRaised) return null;

  return (
    <div className="bg-brand-100 text-brand-0 absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full shadow-lg">
      <Hand className="h-3 w-3" />
    </div>
  );
};
