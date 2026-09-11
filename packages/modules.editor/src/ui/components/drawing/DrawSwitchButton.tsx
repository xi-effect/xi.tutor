import { Button } from '@xipkg/button';
import { Edit } from '@xipkg/icons';

type DrawSwitchButtonProps = {
  onClick: () => void;
};

export const DrawSwitchButton = ({ onClick }: DrawSwitchButtonProps) => {
  return (
    <Button
      size="s"
      variant="none"
      className="bg-background-page rounded-lg px-2"
      onClick={onClick}
    >
      <Edit size="sm" className="size-6" />
    </Button>
  );
};
