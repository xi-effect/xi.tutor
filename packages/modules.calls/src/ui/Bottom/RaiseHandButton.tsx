import { Button } from '@xipkg/button';
import { Hand } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useRaisedHands } from '../../hooks';

export const RaiseHandButton = ({ className }: { className?: string }) => {
  const { toggleHand, isHandRaised, isPending } = useRaisedHands();

  return (
    <Button
      size="icon"
      variant="none"
      onClick={toggleHand}
      className={cn(
        `relative m-0 h-10 w-10 rounded-lg p-0 ${
          isHandRaised ? 'bg-brand-20 text-brand-100' : 'hover:bg-gray-5 text-gray-100'
        }`,
        className,
      )}
      data-umami-event="call-raise-hand"
      data-umami-event-state={isHandRaised ? 'lower' : 'raise'}
      disabled={isPending}
    >
      <Hand className={cn('h-5 w-5', isHandRaised ? 'fill-brand-100' : 'fill-gray-100')} />
    </Button>
  );
};
