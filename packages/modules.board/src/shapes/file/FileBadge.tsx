import { FileShape } from './FileShape';
import { Download } from '@xipkg/icons';
import { cn, formatBytesSize } from '@xipkg/utils';
import { downloadFileRequest } from 'common.services';
import { SyntheticEvent, useState } from 'react';
import { useYjsContext } from '../../providers/YjsProvider';
import { toast } from 'sonner';

type FileBadgeProps = {
  shape: FileShape;
};

const fileBadgeSurfaceClass =
  'border-border-default bg-background-surface flex h-full w-full items-center gap-2 rounded-xl border py-2 pr-[14px] pl-3 shadow-md transition';

export const FileBadge = ({ shape }: FileBadgeProps) => {
  const { src: fileId, fileName, fileSize: size, status } = shape.props;
  const { token: yjsToken } = useYjsContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleIconClick = async (e: SyntheticEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isLoading) return;
    setIsLoading(true);
    toast.success('Загрузка началась...', { duration: 5000 });
    await downloadFileRequest({
      fileId,
      fileName,
      token: yjsToken,
    });
    setIsLoading(false);
  };

  if (status === 'offline') {
    return (
      <div className={fileBadgeSurfaceClass} style={{ pointerEvents: 'none' }}>
        <div className="text-text-disabled flex h-full w-full items-center justify-center">
          <span className="text-xs">{'Отсутствует соединение'}</span>
        </div>
      </div>
    );
  }

  if (status === 'loading' || !fileId) {
    return (
      <div className={fileBadgeSurfaceClass} style={{ pointerEvents: 'none' }}>
        <div className="text-text-disabled flex h-full w-full items-center justify-center">
          <span className="text-xs">{'Загрузка...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(fileBadgeSurfaceClass)} style={{ pointerEvents: 'none' }}>
      <div
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center"
        onPointerDown={handleIconClick}
        style={{ pointerEvents: 'all' }}
      >
        {status === 'uploaded' && <Download className="text-text-secondary h-full w-full" />}
      </div>

      <div className="flex grow flex-col overflow-hidden text-left">
        <p className="text-text-primary truncate leading-[22px] font-medium">{fileName}</p>
        <p className="text-text-primary mt-0.5 text-sm leading-[20px]">{formatBytesSize(size)}</p>
      </div>
    </div>
  );
};
