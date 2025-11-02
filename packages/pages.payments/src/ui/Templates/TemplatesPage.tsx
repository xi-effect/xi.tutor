import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import { TemplatesGrid } from './TemplatesGrid';

export const TemplatesPage = () => {
  return (
    <div className="flex flex-col justify-between gap-6 pr-0 pl-4">
      <div className="flex flex-col">
        <TemplatesGrid />
      </div>

      <div className="flex flex-row items-center justify-end sm:hidden">
        <Button
          size="s"
          className="fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-xl"
        >
          <Plus className="fill-brand-0" />
        </Button>
      </div>
    </div>
  );
};
