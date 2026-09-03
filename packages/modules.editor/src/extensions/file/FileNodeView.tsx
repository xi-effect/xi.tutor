import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Download } from '@xipkg/icons';
import { downloadFileRequest } from 'common.services';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useNodeActiveBlock, useYjsContext } from '../../hooks';
import { formatFileSize } from '../../utils/formatMedia';
import { MediaBlockMenu } from '../media/MediaBlockMenu';

export const FileNodeView = ({ node, getPos }: NodeViewProps) => {
  const { t } = useTranslation('editor');
  const { editor, storageToken, isReadOnly } = useYjsContext();
  const getActiveBlock = useNodeActiveBlock(editor, getPos, 'file');
  const fileName = node.attrs.fileName || t('file.untitled');
  const fileSize = Number(node.attrs.fileSize) || 0;

  const handleDownload = () => {
    if (!node.attrs.src || !storageToken) return;
    toast.success(t('media.downloadStarted'));
    void downloadFileRequest({
      fileId: node.attrs.src,
      fileName,
      token: storageToken,
    });
  };

  return (
    <NodeViewWrapper className="group relative my-3" contentEditable={false}>
      {!node.attrs.src ? (
        <div className="border-border-default bg-background-surface text-text-disabled flex h-[72px] items-center justify-center rounded-xl border text-sm shadow-md">
          {t('file.loading')}
        </div>
      ) : (
        <div className="border-border-default bg-background-surface flex items-center gap-2 rounded-xl border py-2 pr-[14px] pl-3 shadow-md">
          <button
            type="button"
            className="flex size-10 shrink-0 items-center justify-center"
            onClick={handleDownload}
            aria-label={t('media.download')}
          >
            <Download className="fill-icon-secondary size-8" />
          </button>
          <div className="flex min-w-0 grow flex-col overflow-hidden text-left">
            <p className="text-text-primary truncate leading-[22px] font-medium">{fileName}</p>
            {fileSize > 0 ? (
              <p className="text-text-primary mt-0.5 text-sm leading-[20px]">
                {formatFileSize(fileSize)}
              </p>
            ) : null}
          </div>
        </div>
      )}
      <MediaBlockMenu
        editor={editor}
        getActiveBlock={getActiveBlock}
        isReadOnly={isReadOnly}
        onDownload={handleDownload}
      />
    </NodeViewWrapper>
  );
};
