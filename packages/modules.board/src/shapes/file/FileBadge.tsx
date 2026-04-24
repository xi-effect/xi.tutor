import { FileShape } from './FileShape';
import { Download } from '@xipkg/icons';
import { cn, formatBytesSize } from '@xipkg/utils';
import { downloadFileRequest } from 'common.services';
import { SyntheticEvent } from 'react';
import { useYjsContext } from '../../providers/YjsProvider';

type FileBadgeProps = {
  shape: FileShape;
};

export const FileBadge = ({ shape }: FileBadgeProps) => {
  const { src: fileId, fileName, fileSize: size, status } = shape.props;
  const { token: yjsToken } = useYjsContext();

  const handleIconClick = async (e: SyntheticEvent<HTMLDivElement>) => {
    e.stopPropagation();
    await downloadFileRequest({
      fileId,
      fileName,
      token: yjsToken,
    });
  };

  if (status === 'loading' || !fileId) {
    return (
      <div
        className="border-gray-10 bg-gray-0 dark:border-gray-70 flex h-full w-full items-center gap-2 rounded-xl border py-2 pr-[14px] pl-3 shadow-md transition dark:bg-gray-100"
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-gray-40 flex h-full w-full items-center justify-center">
          <span className="text-xs">{'Загрузка...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-gray-10 bg-gray-0 dark:border-gray-70 flex h-full w-full items-center gap-2 rounded-xl border py-2 pr-[14px] pl-3 shadow-md transition dark:bg-gray-100',
      )}
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center"
        onPointerDown={handleIconClick}
        style={{ pointerEvents: 'all' }}
      >
        {status === 'uploaded' && (
          <Download className="text-gray-60 dark:text-gray-40 h-full w-full" />
        )}
      </div>

      <div className="flex grow flex-col overflow-hidden text-left">
        <p className="dark:text-gray-0 truncate leading-[22px] font-medium text-gray-100">
          {fileName}
        </p>
        <p className="text-gray-80 dark:text-gray-40 mt-0.5 text-sm leading-[20px]">
          {formatBytesSize(size)}
        </p>
      </div>
    </div>
  );
};
