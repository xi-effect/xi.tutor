import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { downloadFileRequest, useUploadImage } from 'common.services';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useBlockMenuActions,
  useDrawingToggle,
  useNodeActiveBlock,
  useProtectedImage,
  useYjsContext,
} from '../../hooks';
import { MediaBlockMenu } from '../media/MediaBlockMenu';
import { PdfViewer } from './PdfViewer';
import { optimizeImage } from '../../utils/optimizeImage';
import { StrokeT } from '../../types';
import { DrawMenuItem } from '../../ui/components/drawing/DrawMenuItem';

function isResolvedSrc(src: string) {
  return src.startsWith('blob:') || src.startsWith('http') || src.startsWith('data:');
}

export const PdfNodeView = ({ node, getPos, updateAttributes }: NodeViewProps) => {
  const { t } = useTranslation('editor');
  const { editor, storageToken, isReadOnly } = useYjsContext();
  const getActiveBlock = useNodeActiveBlock(editor, getPos, 'pdf');
  const { insertImage } = useBlockMenuActions(editor, getActiveBlock);
  const { mutateAsync: uploadImage } = useUploadImage();
  const blobUrl = useProtectedImage(node.attrs.src, storageToken);
  const { isDrawing, toggle, close } = useDrawingToggle();

  const handleDownload = () => {
    if (!node.attrs.src || !storageToken) return;
    toast.success(t('media.downloadStarted'));
    void downloadFileRequest({
      fileId: node.attrs.src,
      fileName: node.attrs.fileName || 'document.pdf',
      token: storageToken,
    });
  };

  const handleExtract = useCallback(
    async (blob: Blob, page: number) => {
      if (!storageToken) return;
      const baseName = (node.attrs.fileName || 'pdf').replace(/\.pdf$/i, '');
      const file = new File([blob], `${baseName}_p${page}.png`, { type: 'image/png' });
      const optimized = await optimizeImage(file);
      const uploadedId = await uploadImage({ file: optimized, token: storageToken });
      insertImage(uploadedId, `${baseName} p.${page}`);
    },
    [insertImage, node.attrs.fileName, storageToken, uploadImage],
  );

  const annotations: Record<number, StrokeT[]> = node.attrs.annotations ?? {};

  const handleAnnotationsChange = useCallback(
    (next: Record<number, StrokeT[]>) => updateAttributes({ annotations: next }),
    [updateAttributes],
  );

  return (
    <NodeViewWrapper className="group relative my-3" contentEditable={false}>
      <div className="bg-background-page border-border-default h-[520px] overflow-hidden rounded-xl border shadow-md">
        {!node.attrs.src || !isResolvedSrc(blobUrl) ? (
          <div className="text-text-disabled flex h-full items-center justify-center text-sm">
            {t('pdf.loading')}
          </div>
        ) : (
          <PdfViewer
            blobUrl={blobUrl}
            fileName={node.attrs.fileName || ''}
            totalPages={node.attrs.totalPages || 1}
            isReadOnly={isReadOnly}
            onExtractPage={handleExtract}
            annotations={annotations}
            onAnnotationsChange={handleAnnotationsChange}
            isDrawingBarOpen={isDrawing}
            closeDrawingBar={close}
          />
        )}
      </div>

      <MediaBlockMenu
        editor={editor}
        getActiveBlock={getActiveBlock}
        isReadOnly={isReadOnly}
        onDownload={handleDownload}
        extraItems={<DrawMenuItem onSelect={toggle} />}
      />
    </NodeViewWrapper>
  );
};
