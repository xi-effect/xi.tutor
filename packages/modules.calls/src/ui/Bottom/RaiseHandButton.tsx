import { Button } from '@xipkg/button';
import { Hand } from '@xipkg/icons';
import { useRaisedHands } from '../../hooks/useRaisedHands';
import { useCallStore } from '../../store/callStore';

export const RaiseHandButton = () => {
  const { toggleHand } = useRaisedHands();
  const { isHandRaised } = useCallStore();

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleHand}
      className={`relative m-0 h-10 w-10 rounded-lg p-0 ${
        isHandRaised ? 'bg-brand-0 text-brand-100' : 'hover:bg-gray-5 text-gray-100'
      }`}
    >
      <Hand className="h-5 w-5" />
    </Button>
  );
};
