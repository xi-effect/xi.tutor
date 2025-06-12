import { Button } from '@xipkg/button';
import { Edit, Trash } from '@xipkg/icons';

export const ActionsCell = () => {
  return (
    <div className="invisible flex flex-row items-center justify-end group-hover:visible">
      <div className="flex flex-row items-center justify-between gap-2">
        <Button className="size-8 rounded-lg p-0" variant="ghost" size="s">
          <Edit className="size-4 fill-gray-100" />
        </Button>

        <Button className="size-8 rounded-lg p-0" variant="ghost" size="s">
          <Trash className="size-4 fill-gray-100" />
        </Button>
      </div>
    </div>
  );
};
