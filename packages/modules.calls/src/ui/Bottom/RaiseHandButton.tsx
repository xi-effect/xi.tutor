import { Button } from '@xipkg/button';
import { Hand } from '@xipkg/icons';
import { useRaisedHands } from '../../hooks/useRaisedHands';
import { useCallStore } from '../../store/callStore';
import { cn } from '@xipkg/utils';

export const RaiseHandButton = ({ className }: { className?: string }) => {
  const { toggleHand } = useRaisedHands();
  const { isHandRaised } = useCallStore();

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleHand}
      className={cn(
        `relative m-0 h-10 w-10 rounded-lg p-0 ${
          isHandRaised ? 'bg-brand-20 text-brand-100' : 'hover:bg-gray-5 text-gray-100'
        }`,
        className,
      )}
    >
      <Hand className={cn('h-5 w-5', isHandRaised ? 'fill-brand-100' : 'fill-gray-100')} />
    </Button>
  );
};
